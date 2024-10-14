import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
import moment from "moment";

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } =
    req.body;

  // Validate input fields
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // Check if user already exists
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("User already Registered!", 400));
  }

  // Create a new patient without the availability field
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password, // Ensure you hash the password before saving
    role: "Patient", // Set role as Patient
    // No availability field included
  });

  // Generate token and respond to the client
  generateToken(user, "User Registered!", 200, res);
});
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body;
  if (!email || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password & Confirm Password Do Not Match!", 400)
    );
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Invalid Email Or Password!", 400));
  }
  if (role !== user.role) {
    return next(new ErrorHandler(`User Not Found With This Role!`, 400));
  }
  generateToken(user, "Login Successfully!", 201, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, nic, dob, gender, password } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler("Admin With This Email Already Exists!", 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Admin",
  });
  res.status(200).json({
    success: true,
    message: "New Admin Registered",
    admin,
  });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Doctor Avatar Required!", 400));
  }
  const { docAvatar } = req.files;
  const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File Format Not Supported!", 400));
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    doctorDepartment,
    availability,
    fees, // This will be an array of objects containing day and working hours
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !password ||
    !doctorDepartment ||
    !availability || // Check availability is provided
    !docAvatar ||
    fees === undefined
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }

  // Check if doctor is already registered
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(
      new ErrorHandler("Doctor With This Email Already Exists!", 400)
    );
  }

  // Upload Avatar to Cloudinary
  const cloudinaryResponse = await cloudinary.uploader.upload(
    docAvatar.tempFilePath
  );
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error(
      "Cloudinary Error:",
      cloudinaryResponse.error || "Unknown Cloudinary error"
    );
    return next(
      new ErrorHandler("Failed To Upload Doctor Avatar To Cloudinary", 500)
    );
  }

  // Create the doctor with availability
  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    password,
    role: "Doctor",
    doctorDepartment,
    availability: JSON.parse(availability), // Parse the availability from JSON string
    fees,
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "New Doctor Registered",
    doctor,
  });
});

export const getDoctorsByIds = async (req, res) => {
  try {
    const { ids } = req.query; // Get the IDs from the query string

    // Ensure ids is an array before querying
    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid IDs format." });
    }

    // Find users with Doctor role and include the fees field
    const doctors = await User.find(
      { _id: { $in: ids }, role: "Doctor" },
      { fees: 1, firstName: 1, lastName: 1, email: 1, phone: 1 } // Adjust the fields you want to include
    );

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({ message: "No doctors found." });
    }

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// userController.js

export const getFullDoctorDetailsById = async (req, res) => {
  try {
    const doctorId = req.params.id; // Get the ID from the URL parameter

    // Find the doctor by ID
    const doctor = await User.findById(doctorId)
      .select('-__v') // Exclude the version key if you don't want it in the response
      .lean(); // Convert Mongoose Document to a plain JavaScript object

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor); // Return the doctor details
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAvailableTimes = catchAsyncErrors(async (req, res, next) => {
  const { doctorId, selectedDate } = req.query;

  // Fetch the doctor from User model
  const doctor = await User.findById(doctorId).where('role').equals('Doctor');

  if (!doctor) {
    return res.status(404).json({ success: false, message: "Doctor not found" });
  }

  // Determine the day of the week from selectedDate
  const date = new Date(selectedDate);
  const options = { weekday: 'long' }; // 'long' for full day name
  const dayOfWeek = date.toLocaleDateString('en-US', options);

  // Check the availability based on the day of the week
  const availableTimes = doctor.availability[dayOfWeek];

  if (!availableTimes || !availableTimes.available) {
    return res.status(200).json({ success: true, availableTimes: [], message: `Doctor is not available on ${dayOfWeek}` });
  }

  // Prepare the response with available times
  const response = {
    startTime: availableTimes.startTime,
    endTime: availableTimes.endTime,
  };

  res.status(200).json({ success: true, availableTimes: response });
});


export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});

export const updateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const updatedData = req.body;

    // Check if the doctor exists before trying to update
    const existingDoctor = await User.findById(doctorId);
    if (!existingDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Merge existing data with updated data
    const mergedData = {
      ...existingDoctor.toObject(), // Convert mongoose document to a plain object
      ...updatedData,
    };

    const doctor = await User.findByIdAndUpdate(doctorId, mergedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Doctor updated successfully", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Change to ES module export syntax
export const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    const doctor = await User.findByIdAndDelete(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

// Logout function for dashboard admin
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("adminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Admin Logged Out Successfully.",
    });
});

// Logout function for frontend patient
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(201)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Patient Logged Out Successfully.",
    });
});

export const getDoctorsByDepartment = catchAsyncErrors(
  async (req, res, next) => {
    const { department } = req.query; // Get the department from query parameters

    if (!department) {
      return next(new ErrorHandler("Department is required.", 400));
    }

    // Find doctors by department
    const doctors = await User.find({
      doctorDepartment: department,
      role: "Doctor",
    });

    if (doctors.length === 0) {
      return next(
        new ErrorHandler("No doctors found for this department.", 404)
      );
    }

    res.status(200).json({
      success: true,
      doctors: doctors.map((doctor) => ({
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        // Include other fields as necessary
      })),
    });
  }
);

// export const getPatientById = async (req,res) =>{

//   try{
//     const user = await User.findById(req.user._id);

//     if(!user){
//       return res.status(404).json({message:'User not find'})
//     }

//     user.firstName = req.body.firstName || user.firstName
//     user.lastName = req.body.lastName || user.lastName
//     user.phone = req.body.phone || user.phone
//     // user.password = req.body.password ? await bcrypt.hash(req.body.password,10):user.password

//     const updateUser = await user.save()

//     res.json({
//       _id:updateUser._id,
//       firstName:updateUser.firstName,
//       lastName:updateUser.lastName,
//       // password:updateUser.password

//     })
//   }
//   catch(err){
//     res.status(500).json({message:'Server error'})
//   }

// }

// export const updateUserProfile = async (req, res) => {
//   try {
//       const { firstName, lastName, email, phone, nic, dob, gender, address } = req.body;

//       // Find user by ID and update fields
//       const updatedUser = await User.findByIdAndUpdate(
//           req.user.id, // Assuming req.user contains the authenticated user ID
//           { firstName, lastName, email, phone, nic, dob, gender, address },
//           { new: true, runValidators: true } // Return the updated user document
//       );

//       if (!updatedUser) {
//           return res.status(404).json({ message: 'User not found' });
//       }

//       res.json({ user: updatedUser });
//   } catch (error) {
//       res.status(500).json({ message: 'Server error' });
//   }
// };

export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  try {
    // Retrieve user data from request
    const userId = req.user.id; // Assuming `req.user` contains the authenticated user's ID

    const { firstName, lastName, email, phone, nic, dob, gender, address } = req.body;

    // Find user by ID and update with provided fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        firstName, 
        lastName, 
        email, 
        phone, 
        nic, 
        dob, 
        gender, 
        address 
      },
      { new: true, runValidators: true } // Options to return the updated document and run validators
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

export const getUserProfile = async (req, res) => {
  try {
      const user = await User.findById(req.user.id); // Assuming req.user contains the authenticated user ID
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user });
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
};


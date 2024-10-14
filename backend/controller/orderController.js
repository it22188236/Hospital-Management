import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Order } from "../models/orderSchema.js";

export const addOrder = catchAsyncErrors(async (req, res, next) => {
    const { orderID,
        totalPrice,
        doctorId,
        customerNic,
        address,
        phoneNumber,
        email } = req.body;
    if (!orderID ||
        !totalPrice ||
        !doctorId ||
        !customerNic ||
        !address ||
        !phoneNumber ||
        !email) {
        return next(new ErrorHandler("Please Fill Full Form!", 400));
    }
    await Order.create({ orderID,
        totalPrice,
        doctorId,
        customerNic,
        address,
        phoneNumber,
        email });
    res.status(200).json({
        success: true,
        message: "Order Added!",
    });
});
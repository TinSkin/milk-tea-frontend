import * as Yup from "yup";

export const checkOutSchema = Yup.object({
    fullName: Yup.string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters"),
    phone: Yup.string()
        .required("Phone is required")
        .matches(/^[0-9]{10,11}$/, "Phone must be 10-11 digits"),
    address: Yup.string()
        .required("Address is required")
        .min(5, "Address must be at least 5 characters"),
    totalPrice: Yup.string()
        .required("Total price is required")
        .min(1, "Total price must be greater than 0"),
});


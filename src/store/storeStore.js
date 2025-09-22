import Store from "../models/Store.model.js"

//! Get all stores
export const getAllStores = async (req, res) => {
    try {
        const search = req.query.search || "";
        const status = req.query.status || "all";
        const location = req.query.location || "all";
        

        // Build filter object based on query paramenters
        let filter = {};

        // Get total count and stores with populated fields
        const totalStores = await Store.countDocuments(filter)
        const stores = await Store.find(filter).populate('category')

    } catch (error) {
        console.error("Error fetching stores:", error);
        res.status(500).json({
            success: false, 
            message: "Server error fetching stores"
        })
    }
}


import express from "express";
import auth from "../middleware/auth.js";
import { addAddresses, deleteAddress, getAddresses, updateAddress } from "../controllers/addressesController.js";


const addressRouter = express.Router();

addressRouter.get('/', auth, getAddresses);
addressRouter.post('/', auth, addAddresses);
addressRouter.put('/:id', auth, updateAddress);
addressRouter.delete('/:id', auth, deleteAddress);

export default addressRouter;
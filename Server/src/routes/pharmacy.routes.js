import { Router } from "express";
import { getNearbyPharmacies, getPharmacyDetails } from "../controller/pharmacy.controller.js";

const router=Router();


router.get('/pharmacies', getNearbyPharmacies);
router.get('/pharmacies/:placeId',getPharmacyDetails);

export default router;

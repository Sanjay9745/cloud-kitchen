//create router
var express = require("express");
const router = express.Router();
//import controller
const adminController = require("../controllers/adminController");
const adminAuth = require("../middlewares/adminAuth");
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');

// Set up the storage for uploaded files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
//create routes
router.post("/login", adminController.Login);
// router.post("/register", adminController.Register);
router.post("/add-user", adminAuth, adminController.AddUser);
router.post("/add-users-from-excel",upload.single('excel'), adminAuth, adminController.AddUserFromExcel);
router.post("/update-user/:id", adminAuth, adminController.UpdateUser);
router.post("/add-pause", adminController.AddPause);
router.post("/add-change", adminController.AddChange);
router.post("/add-package", adminAuth, adminController.AddPackage);
router.post("/accept-change", adminAuth, adminController.AcceptChange);
router.post("/reset-password", adminAuth,adminController.ResetPassword)
router.post("/forgot-password", adminController.ForgotPassword)
router.post("/verify-otp", adminController.VerifyOTP)
router.post("/add-location", adminAuth, adminController.AddLocation);
router.post("/add-route", adminAuth, adminController.AddRoute);


router.get("/get-orders-date/:date", adminAuth, adminController.GetOrdersDate);
router.get("/get-users/:page", adminAuth, adminController.GetUsers);
router.get("/get-user/:id", adminAuth, adminController.GetSingleUser);
router.get("/get-user-by-name/:name",adminAuth, adminController.GetUserByName);
router.get("/download-user-template",  adminController.DownloadUserTemplate);
router.get("/packages", adminAuth, adminController.GetPackages);
router.get("/protected", adminAuth, adminController.Protected);
router.get("/changes", adminAuth, adminController.GetChanges);
router.get("/pause-list/:id",adminController.GetPauseList);
router.get("/change-list/:id",adminController.GetChangeList);
router.get("/extra-list/:id",adminController.GetExtraList);
router.get("/get-orders-of-user/:fromDate/:toDate/:userId",adminController.TotalOrdersByTheUser);
router.get("/get-pause-by-date/:date",adminController.GetPauseByDate);
router.get("/locations",adminController.GetLocations);

router.delete("/delete-user/:id", adminAuth, adminController.DeleteUser);
router.delete("/delete-package/:id", adminAuth, adminController.DeletePackage);
router.delete("/decline-change/:id", adminAuth, adminController.DeclineChange);
router.delete("/delete-pause/:id", adminAuth, adminController.DeletePause);
router.delete("/delete-location/:id", adminAuth, adminController.DeleteLocation);
router.delete("/delete-route/:id", adminAuth, adminController.DeleteRoute);
//export router
module.exports = router;

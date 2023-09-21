const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  Admin,
  User,
  Pause,
  Change,
  Package,
  Extra,
  Route,
  Location,
} = require("../db/Scheme");
const jwtSecret = process.env.ADMIN_JWT_SECRET;
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const { generateOTP, sendMail } = require("./emailController");

const Register = (req, res) => {
  const { email, password } = req.body;
  Admin.findOne({ email: email }).then((user) => {
    if (user) {
      res.status(400).json({ email: "Email already exists" });
    } else {
      const newUser = new Admin({
        email,
        password,
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          // if (err) throw err
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
};

const Login = (req, res) => {
  const { email, password } = req.body;
  Admin.findOne({ email: email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          const payload = {
            id: user._id,
            email: user.email,
          };
          const expirationTime = 60 * 60 * 24 * 7; // 1 week in seconds
          // Sign the JWT token with the payload, secret key, and expiration time
          jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: expirationTime },
            (err, token) => {
              if (err) {
                res
                  .status(500)
                  .json({ error: "Error signing token", raw: err });
              } else {
                res.status(200).json({
                  success: true,
                  token: token,
                });
              }
            }
          );
        } else {
          res.status(400).json({ password: "Password or email is incorrect" });
        }
      });
    } else {
      res.status(404).json({ email: "User not found" });
    }
  });
};
const Protected = (req, res) => {
  if (req.user) {
    res.status(200).json({ message: "You are authorized" });
  } else {
    res.status(401).json({ message: "You are not authorized" });
  }
};

//reset password
const ResetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        throw err;
      }

      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) {
          throw err;
        }

        // Assuming you have access to the `Admin` model and `req.user.id` contains the user's ID
        await Admin.updateOne(
          { _id: req.user.id },
          { $set: { password: hash } }
        );

        // Respond with a success message or appropriate response
        res.status(200).json({ message: "Password reset successfully" });
      });
    });
  } catch (error) {
    // Handle errors and respond appropriately
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let adminCheck = await Admin.findOne({ email: email });
    if (adminCheck) {
      const otp = generateOTP(6);
      adminCheck.otp = otp;
      await adminCheck.save();

      await sendMail(
        adminCheck.email,
        "OTP Verification",
        `Your One Time Password is ${adminCheck.otp}`,
        `<h1>Your One Time Password is ${adminCheck.otp}</h1>`
      );

      console.log("Mail sent");
      res.status(200).json({ message: "OTP sent successfully" });
    } else {
      console.log("User not found");
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const VerifyOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;

    // Validate OTP
    if (typeof otp !== "number" || isNaN(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Validate email
    if (!email || typeof email.email !== "string") {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Find and update the admin document to unset the otp field
    let adminCheck = await Admin.findOneAndUpdate(
      { otp: otp, email: email.email },
      { $unset: { otp: 1 } }, // Use $unset to remove the otp field
      { new: true } // Return the updated document
    );

    if (adminCheck) {
      // If OTP matches, create a JWT token
      const payload = {
        id: adminCheck._id,
        email: adminCheck.email,
      };

      const expirationTime = 60 * 60 * 24 * 7; // 1 week in seconds

      // Sign the JWT token with the payload, secret key, and expiration time
      jwt.sign(
        payload,
        jwtSecret,
        { expiresIn: expirationTime },
        (err, token) => {
          if (err) {
            res.status(500).json({ error: "Error signing token", raw: err });
          } else {
            res.status(200).json({
              success: true,
              token: token,
            });
          }
        }
      );
    } else {
      res.status(404).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//create user
const AddUser = async (req, res) => {
  try {
    const { userDetails } = req.body;

    // Check if a user with the provided phone number already exists
    const isUserExist = await User.findOne({
      phoneNumber: userDetails.phoneNumber,
    });

    if (isUserExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user and save it
    const newUser = new User({ ...userDetails });
    newUser
      .save()
      .then((user) => res.json(user))
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error while saving user" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

//update user
const UpdateUser = async (req, res) => {
  try {
    const { userDetails } = req.body;
    const { id } = req.params;

    // Check if a user with the provided ID exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the phone number is being updated and if it already exists for another user
    if (userDetails.phoneNumber !== user.phoneNumber) {
      const checkPhone = await User.findOne({
        phoneNumber: userDetails.phoneNumber,
      });
      if (checkPhone) {
        return res.status(400).json({
          message: "Phone number is already associated with another user",
        });
      }
    }

    // Update the user details
    user.set(userDetails); // This will update the user object with the new details
    await user.save();

    res.json(user); // Return the updated user object
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
const GetSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(400).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
const GetUserByName = async (req, res) => {
  try {
    const { name } = req.params;
    // Use a regular expression to perform a partial match on fullName
    const users = await User.find({
      fullName: { $regex: name, $options: "i" },
    });

    if (users.length > 0) {
      res.status(200).json(users);
    } else {
      res
        .status(404)
        .json({ message: "No users found with the provided name." });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const GetUsers = async (req, res) => {
  try {
    const page = parseInt(req.params.page); // Get the page number from the request parameters as an integer
    const perPage = 10; // Number of users to show per page (you can adjust this as needed)

    // Calculate the skip value based on the page number and perPage
    const skip = (page - 1) * perPage;

    // Fetch users in descending order of some field (e.g., createdAt)
    const users = await User.find()
      .sort({ createdAt: -1 }) // Replace 'createdAt' with the field you want to sort by
      .skip(skip)
      .limit(perPage);

    // Calculate the total number of users
    const totalUsers = await User.countDocuments();

    // Calculate the total page count based on the total users and perPage
    const totalPages = Math.ceil(totalUsers / perPage);

    res.json({ users, totalPages }); // Send users and totalPages as a JSON object
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const DeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    User.findByIdAndDelete(id)
      .then((user) => {
        res.status(200).json({ message: "User deleted successfully" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error while deleting user" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
const DownloadUserTemplate = async (req, res) => {
  try {
    // Path to the XLSX template file
    const templateFilePath = path.join(
      __dirname,
      "../public/template-user.xlsx"
    );

    // Set the appropriate headers for downloading the XLSX file
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=template-user.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ); // XLSX content type

    // Stream the XLSX file content to the response
    const fileStream = fs.createReadStream(templateFilePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error sending XLSX template file:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};
const excelSerialToDate = (serial) => {
  const date = new Date(Date.UTC(1899, 11, 30)); // Excel's date epoch is December 30, 1899
  date.setUTCDate(date.getUTCDate() + serial);
  return date.toISOString().split("T")[0]; // Format as "yyyy-mm-dd"
};

const AddUserFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const buffer = req.file.buffer;
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const dataArray = jsonData.map((row) => {
      const dataObject = {};

      const mealTypes = ["breakfast", "lunch", "dinner"];

      mealTypes.forEach((meal) => {
        dataObject[meal] = {
          selected:
            row[`${meal} selected`]?.toLowerCase() === "yes".toLowerCase(),
          route: row[`${meal} route`] || "",
          location: row[`${meal} location`] || "",
          foodType: (row[`${meal} foodType`] || "")
            .toString()
            .replace(/\s+/g, ""),
          count: parseInt(row[`${meal} count`]) || 0,
          package: row[`${meal} package`] || "",
        };
      });

      const fieldsToMap = [
        "fullName",
        "email",
        "phoneNumber",
        "address",
        "startDate",
        "endDate",
        "note",
        "planType",
      ];

      fieldsToMap.forEach((field) => {
        dataObject[field] = row[field];
      });

      return dataObject;
    });

    // Create a new user for each object in the dataArray and save it
    for (const data of dataArray) {
      try {
        // Check if a user with the same phone number already exists
        let phoneNumber = (data.phoneNumber || "")
          .toString()
          .replace(/\s+/g, "");

        // Check if the phoneNumber does not start with "+91"
        if (!phoneNumber.startsWith("+91")) {
          // If not, check if it starts with "91" and add "+" in front
          if (phoneNumber.startsWith("91")) {
            phoneNumber = "+" + phoneNumber;
          } else {
            // If it doesn't start with either, add "+91" in front
            phoneNumber = "+91" + phoneNumber;
          }
        }

        // Convert Excel date serial numbers to JavaScript Date objects
        data.startDate = excelSerialToDate(data.startDate);
        data.endDate = excelSerialToDate(data.endDate);
        data.planType = (data.planType || "").toString().replace(/\s+/g, "");

        // Check if the parsed dates are valid
        if (
          !isNaN(Date.parse(data.startDate)) &&
          !isNaN(Date.parse(data.endDate))
        ) {
          // Dates are valid, update data object
          data.startDate = data.startDate;
          data.endDate = data.endDate;

          const alreadyExists = await User.findOne({ phoneNumber });

          if (!alreadyExists) {
            const newUser = new User({ ...data, phoneNumber });
            await newUser.save();
          }
        } else {
          console.error(
            "Invalid date format in Excel sheet:",
            data.startDate,
            data.endDate
          );
        }
      } catch (err) {
        console.error(err);
      }
    }
    res.json(dataArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while processing data" });
  }
};

const AddPause = async (req, res) => {
  const { date, meal, userId } = req.body;

  try {
    // Check if a user with the provided userId exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if a pause with the same date, meal, and userId already exists
    const existingPause = await Pause.findOne({ date, meal, userId });
    if (existingPause) {
      return res.status(400).json({
        message: "Pause already exists for this date, meal, and user",
      });
    }

    // Check if the user's meal is selected
    if (!user[meal]?.selected) {
      return res.status(400).json({ message: `User has not selected ${meal}` });
    }

    // Create and save the new pause record
    const newPause = new Pause({
      date,
      meal,
      userId,
    });

    // Calculate the new date for the extra meal by adding 1 day to the endDate
    let extras = await Extra.find({
      userId,
      meal: meal,
    });
    console.log(extras.length);
    const endDate = new Date(user.endDate);
    endDate.setDate(endDate.getDate() + extras.length + 1);

    // Format the newDate as "YYYY-MM-DD"
    const formattedDate = endDate.toISOString().split("T")[0];

    const newExtra = new Extra({
      date: formattedDate,
      meal,
      userId,
    });

    // Save the newExtra document
    await newExtra.save();

    // Set the extraId in the newPause document
    newPause.extraId = newExtra._id;

    // Save the newPause document
    await newPause.save();

    res.json({ message: "Pause added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while adding pause" });
  }
};

const AddChange = async (req, res) => {
  const { date, meal, userId, count, route, location, foodType, package } =
    req.body.change;

  try {
    // Check if a user with the provided userId exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const pause = await Pause.findOne({
      userId: userId,
      meal: meal,
      date: date,
    });
    if (pause) {
      return res.status(405).json({ message: "Already Paused" });
    }
    // Check if a change with the same date, meal, and userId already exists
    const existingChange = await Change.findOne({ date, meal, userId });
    if (existingChange) {
      return res.status(400).json({
        message: "Change already exists for this date, meal, and user",
      });
    }

    // Check if the user's meal is selected
    if (user[meal]?.selected !== true) {
      return res.status(400).json({ message: `User has not selected ${meal}` });
    }

    // Update the user's meal properties based on the provided data
    const mealData = user[meal];

    // Create a newChange object with the provided data
    const newChangeData = {
      date,
      meal,
      userId,
      count: count || mealData?.count,
      route: route || mealData?.route,
      location: location || mealData?.location,
      foodType: foodType || mealData?.foodType,
      package: package || mealData?.package,
    };

    // Create and save the new change record
    const newChange = new Change(newChangeData);
    await newChange.save();

    res.json({ message: "Change added successfully", change: newChange });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while adding change" });
  }
};
const GetPauseList = async (req, res) => {
  try {
    const { id } = req.params;
    const pause = await Pause.find({ userId: id });
    res.status(200).json(pause);
  } catch (error) {
    res.status(500).json({ message: "Error while getting pause" });
  }
};
const GetPauseByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const pauses = await Pause.find({ date });

    // Create an array to store the results with the desired fields
    const pauseResults = [];

    for (const pause of pauses) {
      const user = await User.findById(pause.userId);

      // Extract the desired fields from the user
      const { fullName, phoneNumber } = user;

      pauseResults.push({
        name: fullName,
        phoneNumber,
        meal: pause.meal,
        date: pause.date,
        pauseId: pause._id,
      });
    }

    res.status(200).json(pauseResults);
  } catch (error) {
    res.status(500).json({ message: "Error while getting pause" });
  }
};

const DeletePause = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the pause document by its ID
    const pause = await Pause.findOne({ _id: id });

    // Check if the pause document exists
    if (!pause) {
      return res.status(404).json({ message: "Pause not found" });
    }

    // Find the extra meal document by its ID
    const extra = await Extra.findOne({ _id: pause.extraId });

    // Check if the extra meal document exists
    if (!extra) {
      return res.status(404).json({ message: "Extra meal not found" });
    }

    // Delete the pause document
    await pause.remove();

    // Delete the extra meal document
    await extra.remove();

    res.status(200).json({ message: "Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while deleting pause" });
  }
};

const GetChangeList = async (req, res) => {
  try {
    const { id } = req.params;
    const change = await Change.find({ userId: id });
    res.status(200).json(change);
  } catch (error) {
    res.status(500).json({ message: "Error while getting changes" });
  }
};
const GetExtraList = async (req, res) => {
  try {
    const { id } = req.params;
    const extra = await Extra.find({ userId: id });
    res.status(200).json(extra);
  } catch (error) {
    res.status(500).json({ message: "Error while getting extra" });
  }
};
const GetChanges = async (req, res) => {
  try {
    const changes = await Change.find({ verified: true }).sort({
      createdAt: -1,
    }); // Sort by createdAt in descending order

    const changeData = await Promise.all(
      changes.map(async (change) => {
        const user = await User.findOne({ _id: change.userId });
        if (!user) return null;

        return {
          date: change.date,
          meal: change.meal,
          count: change.count,
          route: change.route,
          location: change.location,
          foodType: change.foodType,
          verified: change.verified,
          package: change.package,
          userName: user.fullName,
          phoneNumber: user.phoneNumber,
        };
      })
    );

    // Filter out null values in case there are changes without associated users
    const filteredChanges = changeData.filter((change) => change);

    res.json(filteredChanges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while getting changes" });
  }
};

const AcceptChange = async (req, res) => {
  const { id } = req.body;
  try {
    const change = await Change.findById(id);

    if (!change) {
      return res.status(400).json({ message: "Change not found" });
    }
    change.verified = true;
    await change.save();
    const user = await User.findById(change.userId);
    if (user.email) {
      sendMail(
        user.email,
        `Changes Accepted`,
        `Your ${change.meal} Changes is Accepted for ${change.date}`,
        `<h2 style="color:dodgerblue;">Your ${change.meal} Changes is Accepted for ${change.date}</h2>`
      );
    }
    res.json({ message: "Change accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error while accepting change" });
  }
};
const DeclineChange = async (req, res) => {
  const { id } = req.params;
  try {
    await Change.deleteOne({ _id: id });
    res.json({ message: "Change declined and deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error while declining change" });
  }
};

const GetOrdersDate = async (req, res) => {
  const { date } = req.params;

  try {
    // Step 1: Find users whose start date and end date match the given date
    const users = await User.find({
      $and: [{ startDate: { $lte: date } }, { endDate: { $gte: date } }],
    });
    // Step 2: Find Change records for that date and update user meal data
    const changes = await Change.find({ date: date });

    const updatedUsersWithChanges = users.map((user) => {
      const userChanges = changes.filter(
        (change) => change.userId === user._id.toString()
      );

      userChanges.forEach((change) => {
        const { meal, count, route, location, foodType, package, verified } =
          change;

        if (verified) {
          user[meal] = {
            selected: true,
            route,
            location,
            foodType,
            count,
            package,
          };
        }
      });

      return user;
    });

    // Step 3: Find Pause records for that date and update user meal data
    const pauses = await Pause.find({ date: date });

    const updatedUsers = updatedUsersWithChanges.map((user) => {
      const updatedUser = { ...user.toObject() }; // Create a copy of the user object

      pauses.forEach((pause) => {
        const mealName = pause.meal;

        if (pause.userId === user._id.toString() && updatedUser[mealName]) {
          // Remove the meal property from the copy
          delete updatedUser[mealName];
        }
      });

      return updatedUser;
    });

    // Step 4: Get the user data from the "extras" collection and apply modifications
    const extras = await Extra.find({ date });

    const extraUsers = await Promise.all(
      extras.map(async (extra) => {
        if (extra.date === date) {
          const newExtraUser = await User.findById(extra.userId);

          // Assuming extra.meal is the name of the meal you want to remove
          const mealToRemove = extra.meal; // Get the meal to remove

          const meals = ["breakfast", "lunch", "dinner"];
          meals.forEach((meal) => {
            if (mealToRemove !== meal) {
              newExtraUser[meal] = {
                selected: newExtraUser[meal].selected || false,
                route: newExtraUser[meal].route || "",
                location: newExtraUser[meal].location || "",
                foodType: newExtraUser[meal].foodType || "",
                count: newExtraUser[meal].count || 0,
                package: newExtraUser.package || "",
              };
            }
          });

          return newExtraUser;
        }
      })
    );

    // Merge extraUsers with updatedUsers
    if (extraUsers) {
      updatedUsers.push(...extraUsers);
    }

    // Step 5: Return the updated array of users for that day
    res.json(updatedUsers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const AddPackage = (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "Please enter a package name" }); // Corrected status code
      return; // Return to avoid executing the rest of the code
    }

    const newPackage = new Package({
      name,
    });

    newPackage
      .save()
      .then((package) => res.json(package))
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error while saving package" });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while saving package" });
  }
};

const GetPackages = (req, res) => {
  try {
    Package.find()
      .then((packages) => res.json(packages))
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error while getting packages" });
      });
  } catch (error) {
    res.status(500).json({ message: "Error while getting packages" });
  }
};
const DeletePackage = (req, res) => {
  try {
    const { id } = req.params;
    Package.findByIdAndDelete(id)
      .then((package) => {
        res.status(200).json({ message: "Package deleted successfully" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Error while deleting package" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while deleting package" });
  }
};

const TotalOrdersByTheUser = async (req, res) => {
  try {
    const { fromDate, toDate, userId } = req.params;
    // Step 1: Validate that fromDate and toDate are within the user's startDate and endDate

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userStartDate = new Date(user.startDate);
    const userEndDate = new Date(user.endDate);
    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);

    if (fromDateObj < userStartDate || toDateObj > userEndDate) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    // Create an array to store the results
    const results = [];

    // Loop from fromDate to toDate in yyyy-mm-dd format
    for (
      var i = new Date(fromDateObj);
      i <= toDateObj;
      i.setDate(i.getDate() + 1)
    ) {
      const date = i.toISOString().split("T")[0];

      // Find orders for each meal (breakfast, lunch, dinner)
      const meals = ["breakfast", "lunch", "dinner"];

      for (const meal of meals) {
        const userMeal = user[meal];

        if (userMeal && userMeal.selected) {
          // Check if there is a pause for the same meal and date
          const pause = await Pause.findOne({ date: date, userId, meal: meal });

          if (!pause) {
            // Check if there is a change for the same meal, date, and verified
            const change = await Change.findOne({
              date: date,
              userId,
              meal: meal,
              verified: true,
            });

            if (change) {
              const { route, location, foodType, count, package } = change;

              // Create a copy of the user's meal data
              const updatedUserMeal = { ...userMeal };

              // Update the copied meal data with change data
              updatedUserMeal.route = route;
              updatedUserMeal.location = location;
              updatedUserMeal.foodType = foodType;
              updatedUserMeal.count = count;
              updatedUserMeal.package = package;

              const order = {
                id: userId,
                date: date,
                name: user.fullName,
                phoneNumber: user.phoneNumber,
                meal: meal,
                route: updatedUserMeal.route || "",
                location: updatedUserMeal.location || "",
                count: updatedUserMeal.count || 0,
                foodType: updatedUserMeal.foodType || "veg",
                package: updatedUserMeal.package || "",
                status: "changed", // Add the status field as "changed"
              };

              // Add the order to the results
              results.push(order);
            } else {
              const order = {
                id: userId,
                date: date,
                name: user.fullName,
                phoneNumber: user.phoneNumber,
                meal: meal,
                route: userMeal.route || "",
                location: userMeal.location || "",
                count: userMeal.count || 0,
                foodType: userMeal.foodType || "veg",
                package: userMeal.package || "",
                status: "", // Status is empty if there is no change
              };

              // Add the order to the results
              results.push(order);
            }
          } else {
            // If there is a pause, add the order with status "paused"
            const order = {
              id: userId,
              date: date,
              name: user.fullName,
              phoneNumber: user.phoneNumber,
              meal: meal,
              route: userMeal.route || "",
              location: userMeal.location || "",
              count: userMeal.count || 0,
              foodType: userMeal.foodType || "veg",
              package: userMeal.package || "",
              status: "paused", // Add the status field as "paused"
            };

            // Add the order to the results
            results.push(order);
          }
        }
      }
    }

    // Step 3: Return the filtered array of orders
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const AddLocation = async (req, res) => {
  try {
    const { location, routeId } = req.body;

    // Create a new Location document with the routeId
    const newLocation = new Location({
      location,
      routeId,
    });

    // Save the new Location document
    await newLocation.save();

    res.status(201).json(newLocation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while adding location and route" });
  }
};
const AddRoute = async (req, res) => {
  try {
    const { route } = req.body;

    // Create a new Route document
    const newRoute = new Route({
      route,
    });

    // Save the new Route document
    await newRoute.save();

    res
      .status(201)
      .json({ message: "Route added successfully", route: newRoute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while adding route" });
  }
};
const GetLocations = async (req, res) => {
  try {
    // Find all Route documents sorted in alphabetical order
    const routes = await Route.find({}).sort({ route: 1 });

    // Find all Location documents sorted in alphabetical order
    const locations = await Location.find({}).sort({ locations: 1 });

    // Send a response with the routes and locations
    res.status(200).json({ routes, locations });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error while fetching locations and routes" });
  }
};
const DeleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the Location document by its ID and delete it
    await Location.findOneAndDelete({ _id: id });

    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while deleting location" });
  }
};
const DeleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the Route document by its ID
    const route = await Route.findOne({ _id: id });

    // Check if the route exists
    if (!route) {
      return res.status(404).json({ message: "Route not found" });
    }

    // Delete the Route document
    await Route.deleteOne({ _id: id });

    // Delete all associated Location documents with the same routeId
    await Location.deleteMany({ routeId: id });

    res
      .status(200)
      .json({ message: "Route and associated Locations deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error while deleting route and associated locations" });
  }
};

module.exports = {
  Register,
  Login,
  Protected,
  ResetPassword,
  ForgotPassword,
  VerifyOTP,
  AddUser,
  UpdateUser,
  GetUsers,
  GetSingleUser,
  GetUserByName,
  DeleteUser,
  AddPause,
  AddChange,
  GetChanges,
  GetPauseList,
  GetChangeList,
  GetExtraList,
  DeclineChange,
  GetOrdersDate,
  AddUserFromExcel,
  AcceptChange,
  DownloadUserTemplate,
  AddPackage,
  GetPackages,
  DeletePackage,
  TotalOrdersByTheUser,
  GetPauseByDate,
  DeletePause,
  AddRoute,
  AddLocation,
  GetLocations,
  DeleteLocation,
  DeleteRoute,
};

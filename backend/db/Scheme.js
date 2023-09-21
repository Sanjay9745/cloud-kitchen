const mongoose = require("mongoose");

// Define schema
const Schema = mongoose.Schema;

// Create schema for user
const userSchema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  note: {
    type: String,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  note: {
    type: String,
  },
  //ENUM   [premium,non-premium]
  planType: {
    enum: ["premium", "non-premium"],
    type: String,
    required: true,
  },
  breakfast: {
    selected: {
      type: Boolean,
    },
    route: {
      type: String,
    },
    location: {
      type: String,
    },
    foodType: {
      enum: ["veg", "non-veg"],
      type: String,
    },
    count: {
      type: Number,
    },
    package: {
      type: String,
    },
  },
  lunch: {
    selected: {
      type: Boolean,
    },
    route: {
      type: String,
    },
    location: {
      type: String,
    },
    foodType: {
      enum: ["veg", "non-veg"],
      type: String,
    },
    count: {
      type: Number,
    },
    package: {
      type: String,
    },
  },
  dinner: {
    selected: {
      type: Boolean,
    },
    route: {
      type: String,
    },
    location: {
      type: String,
    },
    foodType: {
      enum: ["veg", "non-veg"],
      type: String,
    },
    count: {
      type: Number,
    },
    package: {
      type: String,
    },
  },
});

// Create model for user
const User = mongoose.model("User", userSchema);

//Admin
const adminSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
  },
});
const Admin = mongoose.model("Admin", adminSchema);

const pauseSchema = new Schema({
  userId: {
    type: String,
  },
  date: {
    type: String,
  },
  meal: {
    type: String,
  },
  extraId: {
    type: String,
  },
});
const Pause = mongoose.model("Pause", pauseSchema);

const extraSchema = new Schema({
  userId: {
    type: String,
  },
  date: {
    type: String,
  },
  meal: {
    type: String,
  },
});
const Extra = mongoose.model("Extra", extraSchema);
const changeSchema = new Schema({
  userId: {
    type: String,
  },
  date: {
    type: String,
  },
  meal: {
    type: String,
  },
  count: {
    type: Number,
  },
  route: {
    type: String,
  },
  location: {
    type: String,
  },
  foodType: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  package: {
    type: String,
  },
});

const packageSchema = new Schema({
  name: {
    type: String,
  },
});
const Package = mongoose.model("Package", packageSchema);
const Change = mongoose.model("Change", changeSchema);

const locationSchema = new Schema({
  location: {
    type: String,
  },
  routeId: {
    type: String,
  },
});
const routeSchema = new Schema({
  route: {
    type: String,
  },
});
const Location = mongoose.model("Location", locationSchema);
const Route = mongoose.model("Route", routeSchema);
module.exports = {
  User,
  Admin,
  Pause,
  Change,
  Package,
  Extra,
  Location,
  Route,
};

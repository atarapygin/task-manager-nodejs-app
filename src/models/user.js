const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Task = require("../models/task");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age cannot be negative");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
    methods: {
      async generateAuthToken() {
        const user = this;
        const token = jwt.sign({ _id: user._id.toString() }, "asdasdasdsdasd");

        user.tokens = user.tokens.concat({ token });
        user.save();

        return token;
      },
      toJSON() {
        const user = this;
        const userObject = user.toObject();

        delete userObject.password;
        delete userObject.tokens;

        return userObject;
      },
    },
    statics: {
      async findByCredentials(email, password) {
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    },
  }
);

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Delete user tasks when user is deleted
userSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const user = this;

    await Task.deleteMany({ owner: user._id });

    next();
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

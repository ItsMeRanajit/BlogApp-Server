const { createHmac, randomBytes } = require("crypto"); //crypto is a library that helps to hash a password
const { Schema, model } = require("mongoose");
const { createToken, validateToken } = require("../services/auth");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      //thisll be used to hash the password
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "/images/user.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"], // enum means the value of this feild can be only these two
      default: "USER",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  //pre function will be called before creating each user in the database

  const user = this; //this will point to the current user ie the userSchema of that user

  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString(); //this will create random 16character string, this works like a secret to each user

  const hashedPassword = createHmac("sha256", salt).update(user.password).digest("hex");
  //1st param is which algo to use for hashing
  //2nd is for which feild to update
  //3rd to provide the password in hex form

  this.salt = salt;
  this.password = hashedPassword; //the original password is replaced

  next(); //next will be called automatically after execution
});

//so after a salt and hashed pass is created(we can see in the db that hashed pass and salt are randomcharacters). when the user wnats to login to the and enters a password it is hashed in the same way as it stored, and if the created hashed pass and stored hashed pass matches then the user logs in

//mongodb virtual password - we can use it for somewhere else .in here in signin
userSchema.static("matchPassword", async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error("user not found");

  const salt = user.salt;
  const hashedPassword = user.password;
  const userNewPasswordHash = createHmac("sha256", salt).update(password).digest("hex");

  if (hashedPassword !== userNewPasswordHash) throw new Error("incorrect password");

  const token = createToken(user);
  return token;
});
//we hashed again the new pass and checked if it matches the saved one

const User = model("user", userSchema);
module.exports = User;

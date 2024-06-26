const user = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");

const generateUniqueUserId = async () => {
  const capitals = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  const randomCapital = capitals.charAt(
    Math.floor(Math.random() * capitals.length)
  );
  let randomDigits = "";
  for (let i = 0; i < 4; i++) {
    randomDigits += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  const newUniqueUserId = randomCapital + randomDigits;

  const existingUser = await user.findOne({ uniqueUserId: newUniqueUserId });
  if (existingUser) {
    return generateUniqueUserId();
  }

  return newUniqueUserId;
};

exports.signIn = async (req, res) => {
  try {
    const { name, email, mobile, password, District, SubDistrict } = req.body;

    if (!name || !password || !mobile || !District || !SubDistrict || !email) {
      res.status(400).json({
        error: "Fill All Details ",
      });
      return;
    }

    let existingUser = await user.findOne({ mobile });

    if (existingUser) {
      res.status(400).json({
        message: "400-MOBILE",
      });
      return;
    }

    existingUser = await user.findOne({ email });
    // console.log(email);

    if (existingUser) {
      res.status(400).json({
        message: "400-EMAIL",
      });
      return;
    }

    let hashpw;
    try {
      hashpw = await bcrypt.hash(password, 10);
    } catch (err) {
      res.status(500).json({
        error: "error in Hashing",
      });
    }
    console.log(name, email, password, hashpw);
    const uniqueUserId = await generateUniqueUserId();

    console.log(uniqueUserId);

    const data = await user.create({
      name,
      email,
      password: hashpw,
      mobile,
      uniqueUserId,
      District,
      SubDistrict,
    });
    const payload = {
      mobile,
    };

    let token = jwt.sign(payload, "shubham", { expiresIn: "2h" });
    data.token = token;
    data.password = undefined;

    //console.log(token)

    const option = {
      expires: new Date(Date.now() + 3 * 24 * 3600 * 1000),
      httpOnly: true,
    };

    res.cookie("token", token, option).status(200).json({
      sucess: "true",
      data,
    });
  } catch (err) {
    res.status(400).json({
      message: "Unknown Error",
    });
  }
};

exports.logIn = async (req, res) => {
  try {
    let { mobile, password, email } = req.body;

    if ((!mobile && !email) || !password) {
      email = res.user.email;
      password = res.user.password;
      mobile = res.user.mobile;
    }
    console.log(mobile, email, password);
    // console.log(email, res.user, mobile)

    //console.log(identity, password)
    if (!mobile || !password) {
      res.status(400).json({
        message: "400-EMPTY",
      });
      return;
    }

    let response = await user.findOne({ email: mobile });
    if (!response) response = await user.findOne({ mobile });
    console.log(email, response);

    if (!response) {
      res.status(401).json({
        message: "401-USER",
      });
      return;
    }

    const payload = {
      mobile: response.mobile,
      email: response.email,
      uniqueUserId: response.uniqueUserId,
    };

    if (
      (await bcrypt.compare(password, response.password)) ||
      (res.user && res.user.password === response.password)
    ) {
      let token = jwt.sign(payload, "shubham", { expiresIn: "2h" });
      response.token = token;
      response.password = undefined;

      //console.log(token)

      const option = {
        expires: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, option).status(200).json({
        sucess: "true",
        data: response,
      });
    } else {
      res.status(401).json({
        message: "401-PASSWORD",
      });
      return;
    }
  } catch (err) {
    res.status(400).json({
      message: "Unknown Error",
    });
  }
};

exports.logInWithOtp = async (req, res) => {
  try {
    const { email } = req.body;

    //console.log(identity, password)
    if (!email) {
      res.status(400).json({
        message: "400-EMPTY",
      });
      return;
    }

    if (email) response = await user.findOne({ email });

    //console.log(123);

    if (!response) {
      res.status(401).json({
        message: "401-USER",
      });
      return;
    }

    otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });
  } catch (err) {
    res.status(400).json({
      message: "Unknown Error",
    });
  }
};

exports.autoLogin = async (req, res, next) => {
  try {
    const response = await user.findOne({ mobile: res.user.mobile });
    // console.log(response)
    if (!response) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }
    res.status(200).json({
      data: response,
    });
  } catch (err) {
    res.status(400).json({
      message: err || "BAD_REQUEST",
    });
  }
};

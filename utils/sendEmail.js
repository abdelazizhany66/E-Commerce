const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // if secure false port = 587, if true port= 465
    auth: {
      user: "adhmh080@gmail.com",
      pass: "1102000adhm",
    },
  });
  const mailoptions = {
    from: "E-commerce <adhmh080@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  await transporter.sendMail(mailoptions);
};

module.exports = sendEmail;

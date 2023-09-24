const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brands must be have a name"],
      trim: true,
      unique: [true, " Brand soulud be Unique name"],
      minlength: [3, "Too short Brand"],
      maxlength: [32, "Too long Brand"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  {
    timestamps: true,
  }
);

const imageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};

brandSchema.post("init", (doc) => {
  imageURL(doc);
});
brandSchema.post("save", (doc) => {
  imageURL(doc);
});

module.exports = mongoose.model("Brand", brandSchema);

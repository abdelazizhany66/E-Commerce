const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "category should be have name"],
      unique: [true, "Each category must have one name"],
      minlength: [3, "Too short category"],
      maxlength: [32, "Too long category"],
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
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};

categorySchema.post("init", (doc) => {
  imageURL(doc);
});
categorySchema.post("save", (doc) => {
  imageURL(doc);
});

module.exports = mongoose.model("Category", categorySchema);

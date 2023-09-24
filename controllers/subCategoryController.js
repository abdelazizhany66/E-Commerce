const SubCategory = require("../models/subCategoryModel");
const handlerFactory = require("./handlerFactory");

//@ Nested Route in Get
// Get /api/v1/categories/:categoryId/subcategory
exports.setCategoryIdToBody = (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

//@ Nested Route in Create
// Post /api/v1/categories/:categoryId/subcategory
exports.createFilterObj = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};
//@desc   Get list Of Sub Category models
//@Route  Get /api/v1/subcategries
//@access Public
exports.getAllSubCategories = handlerFactory.getAll(SubCategory);
// asyncHandler(async (req, res) => {
//   //Build Query
//   const countDocuments = await SubCategory.countDocuments();
//   const apiFeatures = await new APIFeatures(
//     SubCategory.find(req.filterObj),
//     req.query
//   )
//     .sort()
//     .limitField()
//     .paginate(countDocuments)
//     .filter()
//     .search();

//   //Execute Query
//   const { mongooseQuery, paginationResult } = apiFeatures;
//   const SubCategories = await mongooseQuery;

//   res.status(200).json({
//     result: SubCategories.length,
//     paginationResult,
//     data: SubCategories,
//   });
// });

//@desc   Create a new sub Category
//@route  Post /api/v1 /subcateogries
//@access Private
exports.createSubcategory = handlerFactory.createOne(SubCategory);
//  asyncHandler(async (req, res) => {
//   const { name, category } = req.body;
//   const subCategory = await SubCategory.create({
//     name,
//     slug: slugify(name),
//     category,
//   });
//   res.status(201).json({
//     status: "success",
//     data: subCategory,
//   });
// });

//@Desc   GET specific Category By Id
//@route  Get /api/v1/subcategories/:id
//@access Public
// eslint-disable-next-line no-multi-assign
exports.getSubCategoryById = handlerFactory.getOne(SubCategory);

//@desc  Updata Specific Category By Id
//@route Put /api/v1/subcategory/:id
//@access Private
// exports.applySlugify = (req,res,next)=>{
//   req.body.slug = slugify(req.body.name)
//   next()
// }
exports.updateSubCategory = handlerFactory.updateOne(SubCategory);
//@desc  Delete Sub Category By Id
//@route Delete /api/v1/subcategory/:id
//@access Private
exports.deleteSubCategory = handlerFactory.deleteOne(SubCategory);

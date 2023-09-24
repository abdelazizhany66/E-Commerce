const asyncHandler = require("express-async-handler");
const APIError = require("../utils/apiError");
const APIFeatures = require("../utils/apiFeatures");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    console.log(Model.findByIdAndDelete);
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new APIError(`No document In This Id ${req.params.id}`, 404));
    }
    document.remove();
    res.status(200).json({
      status: `this document ${document.name} is delete`,
    });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(
        new APIError(`No document For this Id ${req.params.id}`, 404)
      );
    }
    document.save();
    res.status(200).json({
      status: "success",
      data: document,
    });
  });

exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    if (req.filterObj) {
      req.filterObj.id = id;
    }
    //buold query
    const query = Model.findById(id);
    if (populationOpt) {
      query.populate(populationOpt);
    }
    const document = await query;
    if (!document) {
      return next(
        new APIError(`No document for this Id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: "success",
      data: document,
    });
  });
exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDocument = await Model.create(req.body);
    // console.log(newDocument);
    res.status(200).json({
      status: "success",
      data: newDocument,
    });
  });

exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // Builed Query
    const countDocuments = await Model.countDocuments();
    const apiFeatures = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .search(modelName)
      .paginate(countDocuments)
      .limitField();
    //executing query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const products = await mongooseQuery;
    res.status(200).json({
      status: "success",
      paginationResult,
      result: products.length,
      data: products,
    });
  });

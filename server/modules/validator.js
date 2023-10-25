const { header, validationResult } = require("express-validator");

exports.myRequestHeaders = [
    header('authorization')
        .exists({ checkFalsy: true })
        .withMessage("Missing Authorization Header")
        .bail()
];

exports.validateRequest = function(req, res, next) {
    const validationErrors = validationResult(req);
    const errorMessages = [];

    for (const e of validationErrors.array()) {
        errorMessages.push(e.msg);
    }
    if (!validationErrors.isEmpty()) {
        return res.status(403).json({ "errors": errorMessages });
    }
    next();
}
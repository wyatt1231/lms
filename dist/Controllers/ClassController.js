"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Authorize_1 = __importDefault(require("../Middlewares/Authorize"));
const ClassRepository_1 = __importDefault(require("../Repositories/ClassRepository"));
const ClassController = (app) => __awaiter(void 0, void 0, void 0, function* () {
    const router = (0, express_1.Router)();
    router.post("/getClassDataTable", (0, Authorize_1.default)("admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        res.json(yield ClassRepository_1.default.getClassDataTable(payload));
    }));
    router.post("/getTutorClassTable", (0, Authorize_1.default)("admin,tutor"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        res.json(yield ClassRepository_1.default.getTutorClassTable(payload, req.user_id));
    }));
    router.post("/getStudentAvailableClassTable", (0, Authorize_1.default)("student"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        res.json(yield ClassRepository_1.default.getStudentAvailableClassTable(payload, req.user_id));
    }));
    router.post("/getStudentOngoingClassTable", (0, Authorize_1.default)("student"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        res.json(yield ClassRepository_1.default.getStudentOngoingClassTable(payload, req.user_id));
    }));
    router.post("/getStudentEndedClassTable", (0, Authorize_1.default)("student"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        res.json(yield ClassRepository_1.default.getStudentEndedClassTable(payload, req.user_id));
    }));
    router.post("/getStudentEnrolledClasses", (0, Authorize_1.default)("student"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield ClassRepository_1.default.getStudentEnrolledClasses(parseInt(req.user_id)));
    }));
    router.post("/addClass", (0, Authorize_1.default)("admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        res.json(yield ClassRepository_1.default.addClass(payload, req.user_id));
    }));
    router.post("/addClassRequest", (0, Authorize_1.default)("admin,student"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        payload.encoder_pk = parseInt(req.user_id);
        res.json(yield ClassRepository_1.default.addClassRequest(payload));
    }));
    router.post("/acknowledgeRequest", (0, Authorize_1.default)("admin,student"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        payload.encoder_pk = parseInt(req.user_id);
        res.json(yield ClassRepository_1.default.acknowledgeRequest(payload));
    }));
    router.post("/getClassRequests", (0, Authorize_1.default)("admin,student"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield ClassRepository_1.default.getClassRequests(req.user_type));
    }));
    router.post("/updateClass", (0, Authorize_1.default)("admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        res.json(yield ClassRepository_1.default.updateClass(payload, req.user_id));
    }));
    router.post("/approveClass", (0, Authorize_1.default)("admin,tutor"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        payload.encoder_pk = req.user_id;
        res.json(yield ClassRepository_1.default.approveClass(payload));
    }));
    router.post("/endClass", (0, Authorize_1.default)("admin,tutor"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        payload.encoder_pk = req.user_id;
        res.json(yield ClassRepository_1.default.endClass(payload));
    }));
    router.post("/rateClass", (0, Authorize_1.default)("student"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        payload.encoded_by = parseInt(req.user_id);
        res.json(yield ClassRepository_1.default.rateClass(payload, req.user_type));
    }));
    router.post("/declineClass", (0, Authorize_1.default)("admin,tutor"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        payload.encoder_pk = req.user_id;
        res.json(yield ClassRepository_1.default.declineClass(payload));
    }));
    router.post("/getSingleClass", (0, Authorize_1.default)("admin,tutor,student"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const class_pk = req.body.class_pk;
        res.json(yield ClassRepository_1.default.getSingleClass(class_pk, parseInt(req.user_id), req.user_type));
    }));
    router.post("/getAllTutorClasses", (0, Authorize_1.default)("admin,tutor"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const tutor_pk = req.body.tutor_pk;
        res.json(yield ClassRepository_1.default.getAllTutorClasses(tutor_pk));
    }));
    //new
    router.post("/getStudentClassByStudentPk", (0, Authorize_1.default)("admin,tutor,student"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const student_pk = req.body.student_pk;
        res.json(yield ClassRepository_1.default.getStudentClassByStudentPk(student_pk));
    }));
    router.post("/getTotalClasses", (0, Authorize_1.default)("admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield ClassRepository_1.default.getTotalClasses());
    }));
    router.post("/getClassSummaryStats", (0, Authorize_1.default)("admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield ClassRepository_1.default.getClassSummaryStats());
    }));
    router.post("/getOpenClassProgressStats", (0, Authorize_1.default)("admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield ClassRepository_1.default.getOpenClassProgressStats());
    }));
    //new
    router.post("/getTotalTutorClassStats", (0, Authorize_1.default)("tutor"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield ClassRepository_1.default.getTotalTutorClassStats(parseInt(req.user_id)));
    }));
    //new
    router.post("/getTotalStudentClassStats", (0, Authorize_1.default)("student"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield ClassRepository_1.default.getTotalStudentClassStats(parseInt(req.user_id)));
    }));
    router.post("/getEndedClassRatingStats", (0, Authorize_1.default)("admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield ClassRepository_1.default.getEndedClassRatingStats());
    }));
    router.post("/getClassRating", (0, Authorize_1.default)("student"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        res.json(yield ClassRepository_1.default.getClassRating(payload, parseInt(req.user_id)));
    }));
    router.post("/getClassRatings", (0, Authorize_1.default)("admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const class_pk = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.class_pk;
        res.json(yield ClassRepository_1.default.getClassRatings(class_pk));
    }));
    app.use("/api/class/", router);
});
exports.default = ClassController;
//# sourceMappingURL=ClassController.js.map
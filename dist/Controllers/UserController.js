"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const UserRepository_1 = __importStar(require("../Repositories/UserRepository")), user_repo = UserRepository_1;
const UserController = (app) => __awaiter(void 0, void 0, void 0, function* () {
    const router = (0, express_1.Router)();
    router.get("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json("20/05/2024 04:45 am - The app is running" + __dirname);
    }));
    router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield user_repo.loginUser(req.body));
    }));
    router.post("/currentUser", (0, Authorize_1.default)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield user_repo.currentUser(req.user_id));
    }));
    router.post("/changeAdminPassword", (0, Authorize_1.default)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const payload = req.body;
        payload.user_id = req.user_id;
        res.json(yield UserRepository_1.default.changeAdminPassword(payload));
    }));
    router.post("/getUserLogs", (0, Authorize_1.default)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield UserRepository_1.default.getUserLogs(parseInt(req.user_id)));
    }));
    router.post("/getAllLogs", (0, Authorize_1.default)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield UserRepository_1.default.getAllLogs());
    }));
    router.post("/getUserNotif", (0, Authorize_1.default)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield UserRepository_1.default.getUserNotif(parseInt(req.user_id)));
    }));
    router.post("/checkUserNotif", (0, Authorize_1.default)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.json(yield UserRepository_1.default.checkUserNotif(req.body.notif_user_pk));
    }));
    app.use("/api/users/", router);
});
exports.default = UserController;
//# sourceMappingURL=UserController.js.map
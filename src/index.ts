import dotenv from "dotenv";
import express from "express";
import FileUpload from "express-fileupload";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { ControllerRegistry } from "./Registry/ControllerRegistry";
import SocketRegistry from "./Registry/SocketRegistry";
export const app = express();

const main = async () => {
  dotenv.config();

  app.use(express.json({ limit: "100mb" }));
  app.use(FileUpload());
  app.use(express.static("./"));

  // app.use(cors());
  const server = http.createServer(app);
  const socketServer = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  ControllerRegistry(app);
  SocketRegistry(socketServer);

  app.use(
    "/static",
    express.static(path.join(__dirname, "../client/build/static"))
  );

  // app.get("*", function (req, res) {
  //   res.sendFile("index.html", {
  //     root: path.join(__dirname, "../client/build/"),
  //   });
  // });

  app.get("*", function (req, res) {
    var fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
    console.log(`fullUrl`, fullUrl);
    if (!req.originalUrl.toString().includes(`/src/`)) {
      res.sendFile("index.html", {
        root: path.join(__dirname, "../client/build/"),
      });
    } else {
      res.status(404).send("Not found");
    }
  });
  app.use("/src", express.static(`src`));

  const PORT = 4040;
  // process.env.PORT ||

  server.listen(PORT, () =>
    console.log(`18/04/2024 04:45 am - listening to ports ${PORT}`)
  );
};

main();

import app from "./app";
import config from "./config";
import logger from "./utils/logger";

const port = config.server.port;

app.listen(port, () => {
  logger.info(`Server listening on port ${port} in ${config.server.env} mode`);
});

import type { GeneralConfiguration } from "server/database/models/configuration.model";
import configurationModel from "server/database/models/configuration.model";
import type { ConfigName } from "server/database/models/settings.model";

class ConfigurationService {
  async getConfigByName<T>(configName: ConfigName): Promise<T | null> {
    try {
      const config: GeneralConfiguration | null = await configurationModel()
        .findOne({ configName })
        .lean();

      if (!config) {
        return null;
      }

      const typedConfig: T = config.settings as T;
      return typedConfig;
    } catch (error) {
      console.error("Error fetching configuration:", error);
      return null;
    }
  }
}

export default ConfigurationService;

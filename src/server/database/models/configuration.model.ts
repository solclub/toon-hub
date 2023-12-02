import mongoose, { Schema, model } from "mongoose";

export interface GeneralConfiguration {
  configName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>;
}

const generalConfigurationSchema = new Schema({
  configName: {
    type: String,
    required: true,
  },
  settings: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

const configurationModel = () => {
  return (
    (mongoose.models?.Configurations as mongoose.Model<GeneralConfiguration>) ||
    model<GeneralConfiguration>("Configurations", generalConfigurationSchema, "configurations")
  );
};

export default configurationModel;

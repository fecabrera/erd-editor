import { createCn } from "cn/config";

export const cn = createCn({
  extend: {
    theme: {
      radius: ["ui", "ui-edge"],
    },
    classGroups: {
      "font-size": [{ text: ["ui-size"] }],
    },
  },
});

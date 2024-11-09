# Escuta AI Browser JS Library

[![npm package](https://img.shields.io/npm/v/@escutaai/js?style=flat-square)](https://www.npmjs.com/package/@escutaai/js)
[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Please see [Escuta AI Docs](https://escutaai.com).
Specifically, [Quickstart/Implementation details](https://escutaai).

## What is Escuta AI

escutaai is your go-to solution for in-product micro-surveys that will supercharge your product experience! 🚀 For more information please check out [escutaai.com](https://escutaai.com).

## How to use this librarys

1. Install the escutaai package inside your project using npm:

```bash
npm install @escutaai/js
```

1. Import escutaai and initialize the widget in your main component (e.g., App.tsx or App.js):

```javascript
import escutaai from "@escutaai/js";

if (typeof window !== "undefined") {
  escutaai.init({
    environmentId: "your-environment-id",
    apiHost: "https://app.escuta.ai",
  });
}
```

Replace your-environment-id with your actual environment ID. You can find your environment ID in the **Setup Checklist** in the escutaai settings. If you want to use the user identification feature, please check out [our docs for details](https://app.escuta.ai).

For more detailed guides for different frameworks, check out our [Framework Guides](https://app.escuta.ai).

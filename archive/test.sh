#!/usr/bin/env bash
npm install bcrypt-promise
npm install koa
npm install koa-router
npm install koa-views
npm install koa-static
npm install koa-bodyparser
npm install koa-body
npm install koa-session
npm install sqlite-async
npm install fs-extra
npm install mime-types
npm install koa-hbs-renderer
npm install bcrypt


node index.js&
node_modules/.bin/jest --detectOpenHandles tests/acceptance/
kill %1

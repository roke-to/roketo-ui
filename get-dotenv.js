#!/usr/bin/env node

const {loadEnv} = require('vite');

const NODE_ENV = process.env.NODE_ENV;
const DOTENV_DIR = process.cwd();

const envName = process.argv[2];

const parsed = loadEnv(NODE_ENV, DOTENV_DIR, '');

console.log(parsed[envName]);

#!/usr/bin/env node

/**
 * Routes File
 */

//testing push

'use strict'

/* MODULE IMPORTS */
const bcrypt = require('bcrypt-promise')
const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticDir = require('koa-static')
const bodyParser = require('koa-bodyparser')
const koaBody = require('koa-body')({ multipart: true, uploadDir: '.' })
const session = require('koa-session')
const sqlite = require('sqlite-async')
const fs = require('fs-extra')
const mime = require('mime-types')
const handlebars = require('koa-hbs-renderer')
//const jimp = require('jimp')

/* IMPORT CUSTOM MODULES */
const User = require('./modules/user')

const app = new Koa()
const router = new Router()

/* CONFIGURING THE MIDDLEWARE */
app.keys = ['darkSecret']
app.use(staticDir('public'))
app.use(bodyParser())
app.use(session(app))
app.use(views(`${__dirname}/views`, { extension: 'handlebars' }, { map: { handlebars: 'handlebars' } }))

const defaultPort = 8080
const port = process.env.PORT || defaultPort
const dbName = 'Domestic-Repairs.db'
const saltRounds = 10


/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 * @authentication This route requires cookie-based authentication.
 */
router.get('/', async ctx => {
	try {
		if (ctx.session.authorised !== true) return ctx.redirect('/login?msg=you need to log in')
		const data = {}
		if (ctx.query.msg) data.msg = ctx.query.msg
		if (ctx.session.admin !== true) await ctx.render('index', { showI: 'Block', AshowI: 'none' })
		if (ctx.session.admin !== false) await ctx.render('index', { showI: 'none', AshowI: 'Block' })
	} catch (err) {
		await ctx.render('error', { message: err.message })
	}
})

/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register'))

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */

router.post('/register', koaBody, async ctx => {
	try {
		// extract the data from the request
		const body = ctx.request.body
		console.log(body)
		const { path, type } = ctx.request.files.avatar
		// call the functions in the module
		const user = await new User(dbName)
		await user.register(body.Username, body.FName, body.LName, body.DateOfBirth, body.Email, body.Password)
		// await user.uploadPicture(path, type)
		// redirect to the home page
		ctx.redirect(`/login?msg=new user "${body.name}" added`)
	} catch (err) {
		await ctx.render('error', { message: err.message })
	}
})


router.get('/login', async ctx => {
	const data = {}
	if (ctx.query.msg) data.msg = ctx.query.msg
	if (ctx.query.user) data.user = ctx.query.user
	await ctx.render('login', data)
})


router.post('/login', async ctx => {
	try {
		const body = ctx.request.body
		const user = await new User(dbName)
		await user.login(body.FName, body.Password)
		ctx.session.authorised = true
		ctx.session.User = body.FName
		const Admin = await user.CheckAdmin(body.FName)
		if (Admin === true) {
			ctx.session.Admin = true
			return ctx.render('index', { showI: 'Block', AshowI: 'none' })
		}
		if (Admin === false) {
			ctx.session.Admin = false
			return ctx.render('index', { showI: 'none', AshowI: 'Block' })
		}
	} catch (err) {
		await ctx.render('error', { message: err.message })
	}
})


router.get('/logout', async ctx => {
	ctx.session.authorised = null
	ctx.redirect('/?msg=you are now logged out')
})

router.get('/JobList', async ctx => {
	if (ctx.session.admin !== true) await ctx.render('JobList', { showJ: 'none', AshowJ: 'Block' })
	if (ctx.session.admin !== false) await ctx.render('JobList', { showJ: 'Block', AshowJ: 'none' })
})


router.get('/AddJob', async ctx => {
	if (ctx.session.admin !== true) await ctx.render('AddJob', { showA: 'Block', AshowA: 'none' })
	if (ctx.session.admin !== false) await ctx.render('AddJob', { showA: 'none', AshowA: 'Block' })
})

router.post('/AddJob', async ctx => {
	try {
		const body = ctx.request.body
		const user = await new User(dbName)
		await user.AddJob(body.CustomerID, body.ApplianceType, body.ApplianceAge, body.Manufacturer, body.FaultDescription)
		if (ctx.session.admin !== true) await ctx.render('AddJob', { showA: 'Block', AshowA: 'none' })
		if (ctx.session.admin !== false) await ctx.render('AddJob', { showA: 'none', AshowA: 'Block' })
	} catch (err) {
		await ctx.render('error', { message: err.message })
	}
})


router.get('/JobStatus', async ctx => {
	const user = await new User(dbName)
	const JobListR = await user.JobList()
	console.log(JobListR)
	if (ctx.session.admin !== true) await ctx.render('JobStatus', { show: 'Block', Ashow: 'none', JobStatus: JobListR })
	if (ctx.session.admin !== false) await ctx.render('JobStatus', { show: 'none', Ashow: 'Block', JobStatus: JobListR })
})

router.post('/JobStatus', async ctx => {
	try {
		const user = await new User(dbName)
		const JobListR = await user.JobList()
		console.log(JobListR)
		if (ctx.session.admin !== true) await ctx.redirect('JobStatus', { show: 'Block', Ashow: 'none', JobStatus: JobListR })
		if (ctx.session.admin !== false) await ctx.redirect('JobStatus', { show: 'none', Ashow: 'Block', JobStatus: JobListR })

	} catch (err) {
		await ctx.render('error', { message: err.message })
	}
})


app.use(router.routes())
module.exports = app.listen(port, async () => console.log(`listening on port ${port}`))


'use strict'

const Accounts = require('../modules/user.js')

describe('register()', () => {

	test('register a valid account', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		const register = await account.register('doej', 'brhane', '22/03/199', 'kebrom@com.com', 'password')
		expect(register).toBe(true)
		done()
	})

	test('register a duplicate username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'brhane', '22/03/199', 'kebrom@com.com', 'password')
		await expect(account.register('doej', 'brhane', '22/03/199', 'kebrom@com.com', 'password'))
			.rejects.toEqual(Error('username "doej" already in use'))
		done()
	})

	test('error if blank username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect(account.register('', 'brhane', '22/03/199', 'kebrom@com.com', 'password'))
			.rejects.toEqual(Error('missing username'))
		done()
	})

	test('error if blank password', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect(account.register('doej', 'brhane', '22/03/199', 'kebrom@com.com', ''))
			.rejects.toEqual(Error('missing password'))
		done()
	})

})

/*describe('uploadPicture()', () => {
	// this would have to be done by mocking the file system
	// perhaps using mock-fs?
})*/

describe('login()', () => {
	test('log in with valid credentials', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'brhane', '22/03/199', 'kebrom@com.com', 'password')
		const valid = await account.login('doej', 'password')
		expect(valid).toBe(true)
		done()
	})

	test('invalid username', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'brhane', '22/03/199', 'kebrom@com.com', 'password')
		await expect(account.login('roej', 'password'))
			.rejects.toEqual(Error('CustomerFName "roej" not found'))
		done()
	})

	test('invalid password', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await account.register('doej', 'brhane', '22/03/199', 'kebrom@com.com', 'password')
		await expect(account.login('doej', 'bad'))
			.rejects.toEqual(Error('invalid password for account "doej"'))
		done()
	})

})


describe('AddJob()', () => {
	test('valaid input', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		const AddJob = await account.AddJob('1', 'TV', '5', 'Samsung', 'Screen broken')
		expect(AddJob).toBe(true)
		done()
	})


	test('Missing Customer ID', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect(account.AddJob('', 'TV', '5', 'Samsung', 'Screen broken'))
			.rejects.toEqual(Error('You Need A CustomerID'))
		done()
	})

	test('Missing Appliance type', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect(account.AddJob('1', '', '5', 'Samsung', 'Screen broken'))
			.rejects.toEqual(Error('Appliance Type Required '))
		done()
	})

	test('Missing Manufacturer ', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect(account.AddJob('1', 'TV', '5', '', 'Screen broken'))
			.rejects.toEqual(Error('Manufacturer Required '))
		done()
	})

	test('Missing FaultDescription type', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect(account.AddJob('1', 'TV', '5', 'Samsung', ''))
			.rejects.toEqual(Error('FaultDescription Required '))
		done()
	})

	test('Missing Appliance Age ', async done => {
		expect.assertions(1)
		const account = await new Accounts()
		await expect(account.AddJob('1', 'TV', '', 'Samsung', ''))
			.rejects.toEqual(Error('Appliance Age Required '))
		done()
	})

})

describe('GetJobStats()', () => {
	test('valaid input', async done => {



	})

})

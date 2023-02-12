/* eslint-disable complexity */

'use strict'

const bcrypt = require('bcrypt-promise')
const fs = require('fs-extra')
const mime = require('mime-types')
const sqlite = require('sqlite-async')
const saltRounds = 10

module.exports = class User {

	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS Customer (CustomerUserName TEXT PRIMARY KEY\
				UNIQUE, CustomerFName TEXT,\
				CustomerLName TEXT, CustomerDOB DATE, CustomerEmail TEXT,pass TEXT, Admin BOOLEAN DEFAULT (False));'
			await this.db.run(sql)

			const addJob = 'CREATE TABLE IF NOT EXISTS  NewJob (JobID  INTEGER PRIMARY KEY AUTOINCREMENT,\
				CustomerID       TEXT    REFERENCES CustomerId (CustomerId),\
				ApplianceType    TEXT,\
				ApplianceAge     TEXT,\
				Manufacturer     TEXT,\
				FaultDescription TEXT,\
				Status           TEXT DEFAULT Job_Under_Review\);'
			await this.db.run(addJob)
			return this
		})()
	}

	async register(CustomerUserName,CustomerFName, CustomerLName, CustomerDOB, CustomerEmail, pass) {
		try {
			if (CustomerUserName.length === 0) throw new Error('missing username')
			if (pass.length === 0) throw new Error('missing password')
			let sql = `SELECT COUNT(CustomerUserName) as records FROM Customer WHERE CustomerFName="${CustomerUserName}";`
			const data = await this.db.get(sql)
			if (data.records !== 0) throw new Error(`username "${CustomerUserName}" already in use`)
			pass = await bcrypt.hash(pass, saltRounds)
			sql = `INSERT INTO Customer(CustomerUserName,CustomerFName, CustomerLName, CustomerDOB, CustomerEmail, pass)\
					 VALUES("${CustomerUserName}","${CustomerFName}", "${CustomerLName}", "${CustomerDOB}", "${CustomerEmail}", "${pass}")`
			await this.db.run(sql)
			return true
		} catch (err) {
			throw err
		}
	}

	/*async uploadPicture(path, mimeType) {
		const extension = mime.extension(mimeType)
		console.log(`path: ${path}`)
		console.log(`extension: ${extension}`)
		//await fs.copy(path, `public/avatars/${username}.${fileExtension}`)
	}*/

	async login(FName, Password) {
		try {
			let sql = `SELECT count(CustomerID) AS count FROM Customer WHERE CustomerFName="${FName}";`
			const records = await this.db.get(sql)
			if (!records.count) throw new Error(`CustomerFName "${FName}" not found`)
			sql = `SELECT pass FROM Customer WHERE CustomerFName = "${FName}";`
			const record = await this.db.get(sql)
			const valid = await bcrypt.compare(Password, record.pass)
			if (valid === false) throw new Error(`invalid password for account "${FName}"`)
			return true
		} catch (err) {
			throw err
		}
	}

	// eslint-disable-next-line max-lines-per-function
	async AddJob(CustomerID, ApplianceType, ApplianceAge, Manufacturer, FaultDescription) {
		try {
			if (CustomerID.length === 0) throw new Error('You Need A CustomerID')
			if (ApplianceType.length === 0) throw new Error('Appliance Type Required ')
			if (ApplianceAge.length === 0) throw new Error('Appliance Age Required ')
			if (Manufacturer.length === 0) throw new Error('Manufacturer Required ')
			if (FaultDescription.length === 0) throw new Error('FaultDescription Required ')
			const sql = `INSERT INTO NewJob(CustomerID, ApplianceType, ApplianceAge, Manufacturer, FaultDescription)\ 
			VALUES("${CustomerID}","${ApplianceType}" ,"${ApplianceAge}","${Manufacturer}","${FaultDescription}")`
			await this.db.run(sql)
			return true
		} catch (err) {
			throw err
		}
	}

	async CheckAdmin(FName) {
		try {
			const sql = `SELECT Admin FROM Customer WHERE CustomerFName = "${FName}";`
			const record = await this.db.get(sql)
			console.log(record)
			if (record.Admin === 0)
				return false
			if (record.Admin === 1)
				return true
		} catch (err) {
			throw err
		}
	}

	async JobList() {
		try {
			const sql = `SELECT * FROM NewJob;`
			const record = await this.db.all(sql)
			return record
		} catch (err) {
			throw err
		}
	}


}

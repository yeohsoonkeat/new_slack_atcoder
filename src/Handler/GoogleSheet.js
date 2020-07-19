const { spreadSheetId, client_email, private_key } = require('../config')
const { ArrayToGoogleSheets } = require('array-to-google-sheets')

class Sheet {
    constructor(dop, subteam) {
        const credentials = {
            client_email,
            private_key
        }
        this._spreadsheetID = spreadSheetId
        this._googleSheets = new ArrayToGoogleSheets({credentials})
        this.DOP = dop
        this.subteam = subteam
    }

    _getSpreadSheet() {
        return this._googleSheets.getSpreadsheet(this._spreadsheetID)
        .catch(err => console.log(err))
    }

    async _getSheet(sheetName) {
        const spreadsheet = await this._getSpreadSheet()
        return  spreadsheet.findOrCreateSheet(sheetName)
        .catch(err => console.log(err))
    }

    async updateSheet(values, sheetName) {
        const sheet = await this._getSheet(sheetName)
        const updateOptions = {
            minRow: 3, // styling
            minColumn: 3, // styling
            margin: 5,  // styling
            fitToSize: false,  // remove empty cells
            clearAllValues: false, // clear all existing values
        }
        const updateResult = await sheet.update(values, updateOptions).catch(err => console.log(err))
        console.log(updateResult, sheetName)
    }

    async _updateAllConnected() {
        const connected = await this.DOP.getAllStudent()
        const key = Object.keys(connected[0])
        this.updateSheet([key, ...connected.map(x=>Object.values(x))], "Connected")
    }

    async _updateSubteam() {
        const slack = await this.subteam.getAllUserInGroups()
        const header = ['slack_username', 'atcoder_username', 'highest_score', 'current_score', 'num_competitions','recent_competion']
        const usergroups = Object.keys(slack)
        for (const group of usergroups) {
            const members = slack[group]
            const data = await this.DOP.getStudentInBulkForSheet(members)
            await this.updateSheet([header, data], group)
        }
        console.log("Done Update subteam")
    }

    async fullUpdate(){
        this._updateAllConnected()
        this._updateSubteam()
    }

    async backup() {
        const sheet = await this._getSheet()
        await sheet.exportAsCsv("./src/db/data.csv")
    }
    
}

module.exports = {
    Sheet
}

const { GROUP_NAMES, GROUP_IDS } = require('../config')

class Subteam {
    constructor(app, token){
        this.app = app
        this.token = token
    }

    _getGroups() {
        return this.app.client.usergroups.list({
            token: this.token
        })
        .then(res => res.usergroups)
        .catch(err => console.log(err))
    }
    getUsersByGroup(usergroup) {
        return this.app.client.usergroups.users.list({
            token: this.token,
            usergroup 
        })
        .then(res => res.users)
        .catch(err => console.log(err))
    }

    async getAllUserInGroups() {
        const groups = await this._getGroups()
        const groupUsers = {}
        for (let {id, name} of groups){
            if (GROUP_IDS.includes(id) || GROUP_NAMES.includes(name)){
                const users = await this.getUsersByGroup(id)
                groupUsers[name]=users
            }
        }
        return groupUsers
    }
}

module.exports ={
     Subteam
}
import { Service } from './base'

export default class RoleService extends Service {
  addRolesToParent (target) {
    return this.api.request({
      url: `${this.model}/addRolesToParent`,
      method: 'POST',
      data: target,
    });
  }

  updateRolesToParent (target) {
    return this.api.request({
      url: `${this.model}/updateRolesToParent`,
      method: 'POST',
      data: target,
    });
  }

  getRole (target) {
    return this.api.request({
      url: `${this.model}/get`,
      method: 'POST',
      data: target,
    });
  }

  getRoleWith (target) {
    return this.api.request({
      url: `${this.model}/getWithUser`,
      method: 'POST',
      data: target,
    });
  }

  getUsersInRole (target) {
    return this.api.request({
      url: `${this.model}/getUsersInRole`,
      method: 'POST',
      data: target,
    });
  }

  getUsersInRoleOnly (target) {
    return this.api.request({
      url: `${this.model}/getUsersInRoleOnly`,
      method: 'POST',
      data: target,
    });
  }

  removeUsersFromRoles (target) {
    return this.api.request({
      url: `${this.model}/removeUsersFromRoles`,
      method: 'POST',
      data: target,
    });
  }

  removeUsersFromRolesAndInheritedRole (target) {
    return this.api.request({
      url: `${this.model}/removeUsersFromRolesAndInheritedRole`,
      method: 'POST',
      data: target,
    });
  }

  getUsersInNotRole (target) {
    return this.api.request({
      url: `${this.model}/getUsersInNotRole`,
      method: 'POST',
      data: target,
    });
  }

  getUsersInNotRoleOnly (target) {
    return this.api.request({
      url: `${this.model}/getUsersInNotRoleOnly`,
      method: 'POST',
      data: target,
    });
  }

  addUsersToRoles (target) {
    return this.api.request({
      url: `${this.model}/addUsersToRoles`,
      method: 'POST',
      data: target,
    });
  }

  addUsersToRolesAndRoleParents (target) {
    return this.api.request({
      url: `${this.model}/addUsersToRolesAndRoleParents`,
      method: 'POST',
      data: target,
    });
  }
  
  addCurrentUserToRolesAndRoleParents (target) {
    return this.api.request({
      url: `${this.model}/addCurrentUserToRolesAndRoleParents`,
      method: 'POST',
      data: target,
    });
  }

  paginationForRulesRoles (selector, options) {
    return this.api.request(
      {
        url: `${this.model}/rules_roles/pagination`,
        method: 'POST',
        data: {
          selector,
          options,
        },
      },
      {
        isTransformResponse: true,
      }
    );
  }

  addRules (target) {
    return this.api.request({
      url: `${this.model}/addRules`,
      method: 'POST',
      data: target,
    });
  }

  removeRules (target) {
    return this.api.request({
      url: `${this.model}/removeRules`,
      method: 'POST',
      data: target,
    });
  }

  getInheritedRoleNamesOnly (target) {
    return this.api.request({
      url: `${this.model}/getInheritedRoleNamesOnly`,
      method: 'POST',
      data: target,
    });
  }

  permissions (target) {
    return this.api.request({
      url: `${this.model}/permissions`,
      method: 'get',
      data: target,
    });
  }

  getRoleWithUser (target ) {
    return this.api.request({
      url: `${this.model}/getRoleWithUser`,
      method: 'post',
      data: target,
    });
  }

}

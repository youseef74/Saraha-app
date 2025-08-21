export const genderEnum = {
    MALE:"male",
    FEMALE:"female",
    
}


export const roleEnum = {
    USER:"user",
    ADMIN:"admin",
    SUPER_ADMIN:"superAdmin"
}


export const privillage = {
    ADMINS:[roleEnum.ADMIN,roleEnum.SUPER_ADMIN],
    SUPER_ADMIN:[roleEnum.SUPER_ADMIN],
    ADMIN:[roleEnum.ADMIN],
    USERS:[roleEnum.USER],
    ALL:[roleEnum.ADMIN,roleEnum.SUPER_ADMIN,roleEnum.USER],
    USER_ADMIN:[roleEnum.USER,roleEnum.ADMIN],
    USER_SUPER_ADMIN:[roleEnum.USER,roleEnum.SUPER_ADMIN],
    ADMIN_SUPER_ADMIN:[roleEnum.ADMIN,roleEnum.SUPER_ADMIN]

}

export const skillLevelEnum = {
    BEGINNER:"beginner",
    INTERMEDIATE:"intermediate",
    ADVANCED:"advanced"
}

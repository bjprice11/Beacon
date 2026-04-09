export interface AuthSession {
    isAuthenticated: boolean,
    userName: string | null,
    email: string | null,
    roles: string[],
    /** Present when the Identity user is linked to a `Supporter` row (`IdentityUserId`). */
    supporterId?: number | null,
    /** True when donor profile (e.g. after Google) still needs name/org/phone. */
    needsProfileCompletion?: boolean,
}
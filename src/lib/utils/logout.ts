import authStore from "$lib/shared/store/auth"

const logout = () => {
  authStore.set({ accessToken: '', username: '' })
}

export default logout
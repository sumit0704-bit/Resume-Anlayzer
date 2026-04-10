import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

export async function register({ username, email, password }) {
    try {
        const res = await api.post("/api/auth/register", {
            username, email, password
        })
        return res.data
    } catch (err) {
        console.error("Register Error:", err?.response?.data || err.message)
        throw err
    }
}

export async function login({ email, password }) {
    try {
        const res = await api.post("/api/auth/login", {
            email, password
        })
        return res.data
    } catch (err) {
        console.error("Login Error:", err?.response?.data || err.message)
        throw err
    }
}

export async function logout() {
    try {
        const res = await api.get("/api/auth/logout")
        return res.data
    } catch (err) {
        console.error("Logout Error:", err)
        throw err
    }
}

export async function getMe() {
    try {
        const res = await api.get("/api/auth/get-me")
        return res.data
    } catch (err) {
        console.error("GetMe Error:", err)
        throw err
    }
}
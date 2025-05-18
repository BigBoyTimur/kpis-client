import axios from "axios";

export const loginFunc = async (login: string, password: string) => {
    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/auth_polytech/login`,
        { login, password, service_name: "empl_eval_sys" }
      );
      if (response.data.status === "success") {
        //navigate("/profile");
      }
    } catch (error) {
      console.error("Error Auth:", error);
    }
  }



export const verifyFunc = async (login: string, code: string) => {
    const codeN = Number(code);
    try {
        const response = await axios.post(
            `http://127.0.0.1:8000/auth_polytech/verify`,
            { login, code: codeN, service_name: "empl_eval_sys" }
        );
        
        if(response.status == 200){
            window.location.href = "/"
        }
            
            localStorage.setItem('user_id', response.data.user_id);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
        
    } catch (error) {
        console.error("Error Auth:", error);
    }
};
  
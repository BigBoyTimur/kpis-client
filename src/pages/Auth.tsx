import { useState } from "react";
import Modal from "react-modal";
import { FiX } from "react-icons/fi";
import { loginFunc, verifyFunc } from "@/hooks/auth";



const Auth = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [code, setCode] = useState("");
  const [confirmationError, setConfirmationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!login || !password) {
      setLoginError("Пожалуйста, заполните все поля");
      return;
    }

    try {
      await loginFunc(login, password);
      setShowConfirmation(true);
    } catch (error) {
      setLoginError("Ошибка входа. Проверьте данные и попробуйте снова.");
    }
  };

  const handleVerify = async () => {
    if (!code) {
      setConfirmationError("Пожалуйста, введите код подтверждения");
      return;
    }

    try {
      await verifyFunc(login, code);
      setShowConfirmation(false);
    } catch (error) {
      setConfirmationError("Неверный код подтверждения");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${showConfirmation ? "filter blur-sm" : ""}`}>
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Вход в систему</h2>
        </div>

        {loginError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="text-red-500">{loginError}</div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="login" className="sr-only">
                Логин
              </label>
              <input
                id="login"
                name="login"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Войти
            </button>
          </div>
        </form>

        {/* Модальное окно подтверждения */}
        <Modal
          isOpen={showConfirmation}
          onRequestClose={() => setShowConfirmation(false)}
          contentLabel="Подтверждение почты"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl p-6 outline-none"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Подтверждение почты</h2>
            <button
              onClick={() => setShowConfirmation(false)}
              className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Введите код подтверждения"
              className={`w-full px-3 py-2 border rounded ${
                confirmationError ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {confirmationError && (
              <p className="text-red-500 text-sm mt-1">{confirmationError}</p>
            )}
          </div>

          <button
            onClick={handleVerify}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Подтвердить
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default Auth;
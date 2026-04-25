<?php

namespace Modules\CoreModule\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use Modules\CoreModule\Http\Requests\Auth\LoginRequest;
use Symfony\Component\HttpFoundation\Response;

class LoginController extends Controller
{
    /**
     * Display the login form.
     */
    public function showLoginForm()
    {
        $massage = 'Unauthenticated';

        return response()->json(compact('massage'), Response::HTTP_NOT_FOUND);

        //        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        $user = \App\Models\User::where('national_id', $request->national_id)
            ->orWhere('name', $request->national_id)
            ->first();

        $user->tokens()->delete();

        $plainTextToken = $user->createToken($user->national_id)->plainTextToken;

        $user->token = $plainTextToken;

        return (new UserResource($user))->response()->setStatusCode(Response::HTTP_ACCEPTED);

        //        $request->session()->regenerate();

        //        return redirect()->intended(route('dashboard'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function logout(Request $request): RedirectResponse
    {
        $request->user()->tokens()->delete();

        Auth::logout();

        $massage = 'logout Sccesesful';

        return response()->json(compact('massage'), Response::HTTP_ACCEPTED);

        //        $request->session()->invalidate();
        //
        //        $request->session()->regenerateToken();
        //
        //        return redirect()->route('login');
    }
}

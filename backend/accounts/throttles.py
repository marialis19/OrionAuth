from rest_framework.throttling import AnonRateThrottle

class LoginThrottle(AnonRateThrottle):
    scope = "login"


class RegisterThrottle(AnonRateThrottle):
    scope = "register"


class OTPThrottle(AnonRateThrottle):
    scope = "otp"


class VerifyOTPThrottle(AnonRateThrottle):
    scope = "verify_otp"
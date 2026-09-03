package httpapi

import "testing"

func TestSafeReturnTo(t *testing.T) {
	tests := map[string]string{
		"":                          "/profile",
		"/profile/edit?tab=data":    "/profile/edit?tab=data",
		"//evil.example/path":       "/profile",
		"https://evil.example/path": "/profile",
		"profile":                   "/profile",
	}
	for input, want := range tests {
		if got := safeReturnTo(input); got != want {
			t.Errorf("safeReturnTo(%q) = %q, want %q", input, got, want)
		}
	}
}

func TestNormalizeGender(t *testing.T) {
	for input, want := range map[string]string{"male": "L", "Laki-laki": "L", "P": "P", "wanita": "P", "unknown": ""} {
		if got := normalizeGender(input); got != want {
			t.Errorf("normalizeGender(%q) = %q, want %q", input, got, want)
		}
	}
}

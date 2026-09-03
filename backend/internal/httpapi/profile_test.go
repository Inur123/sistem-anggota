package httpapi

import (
	"strings"
	"testing"
	"time"
)

func validProfileRequest() SaveProfileRequest {
	return SaveProfileRequest{
		Version:      1,
		Tingkatan:    "pac",
		Pimpinan:     "pac-1",
		PimpinanName: "PAC Magetan",
		Ranting:      "ranting-1",
		RantingName:  "PR Tawanganom",
		RantingType:  "RANTING",
		FormData: ProfileFormData{
			NIK:        "3520010101010001",
			BirthPlace: "Magetan",
			BirthDate:  "2003-05-14",
			Address:    "Jalan Kaderisasi",
			Educations: []Education{{Level: "S1", Institution: "Universitas"}},
			Trainings:  []Training{{Name: "Makesta", Date: "2024-07-10", Place: "Magetan"}},
		},
	}
}

func TestValidateProfileRequest(t *testing.T) {
	request := validProfileRequest()
	if message := validateProfileRequest(request); message != "" {
		t.Fatalf("validateProfileRequest() = %q, want valid", message)
	}
}

func TestValidateProfileRequestRejectsInvalidNIK(t *testing.T) {
	request := validProfileRequest()
	request.FormData.NIK = "352001010101000X"
	if message := validateProfileRequest(request); !strings.Contains(message, "NIK") {
		t.Fatalf("validateProfileRequest() = %q, want NIK error", message)
	}
}

func TestValidateProfileRequestRejectsFutureBirthDate(t *testing.T) {
	request := validProfileRequest()
	request.FormData.BirthDate = time.Now().AddDate(1, 0, 0).Format("2006-01-02")
	if message := validateProfileRequest(request); !strings.Contains(message, "Tanggal lahir") {
		t.Fatalf("validateProfileRequest() = %q, want birth date error", message)
	}
}

func TestValidateProfileRequestRejectsIncompleteTraining(t *testing.T) {
	request := validProfileRequest()
	request.FormData.Trainings[0].Place = ""
	if message := validateProfileRequest(request); !strings.Contains(message, "pengkaderan") {
		t.Fatalf("validateProfileRequest() = %q, want training error", message)
	}
}

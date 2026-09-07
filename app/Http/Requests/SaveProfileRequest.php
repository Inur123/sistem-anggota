<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'version' => ['required', 'integer', 'min:1'],
            'target_role' => ['nullable', Rule::in(['CABANG', 'PAC'])],
            'target_id' => ['nullable', 'required_with:target_role', 'string', 'max:255'],
            'wilayah_id' => ['nullable', 'string', 'max:255', Rule::prohibitedIf($this->input('target_role') === 'CABANG')],
            'nik' => ['nullable', 'regex:/^[0-9]{16}$/'], 'nia' => ['nullable', 'string', 'max:100'],
            'birth_place' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
            'address' => ['nullable', 'string', 'max:2000'], 'hobby' => ['nullable', 'string', 'max:1000'],
            'occupation' => ['nullable', 'string', 'max:255'], 'position' => ['nullable', 'string', 'max:255'],
            'educations' => ['present', 'array', 'max:20'], 'educations.*.level' => ['required', 'string', 'max:100'],
            'educations.*.institution' => ['required', 'string', 'max:255'],
            'trainings' => ['present', 'array', 'max:50'], 'trainings.*.name' => ['required', 'string', 'max:100'],
            'trainings.*.date' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'trainings.*.place' => ['required', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return ['required' => ':attribute wajib diisi.', 'required_with' => ':attribute wajib dipilih.',
            'nik.regex' => 'NIK harus terdiri dari tepat 16 angka.', 'date_format' => 'Gunakan tanggal yang valid.',
            'before_or_equal' => 'Tanggal tidak boleh melewati hari ini.', 'max' => ':attribute terlalu panjang.',
            'wilayah_id.prohibited' => 'Cabang tidak menggunakan ranting atau komisariat.'];
    }

    public function attributes(): array
    {
        return ['target_id' => 'Pimpinan', 'version' => 'Versi profil', 'educations.*.level' => 'Jenjang pendidikan',
            'educations.*.institution' => 'Instansi pendidikan', 'trainings.*.name' => 'Pengkaderan',
            'trainings.*.date' => 'Tanggal pengkaderan', 'trainings.*.place' => 'Tempat pengkaderan'];
    }
}

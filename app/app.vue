<script setup lang="ts">
import { reactive, ref } from 'vue'
import { z } from 'zod'

const form = reactive({
    nom: '',
    prenom: '',
    wantLocation: false,
    studentId: '',
})

const errorMsg = ref('')

const schema = z.object({
    nom: z.string().min(1, 'Nom de famille requis'),
    prenom: z.string().min(1, 'Prénom requis'),
    studentId: z.string().min(1, 'Identifiant requis'),
    wantLocation: z.boolean(),
})

async function onQrUpload(e: Event) {
    errorMsg.value = ''
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
        errorMsg.value = 'Veuillez sélectionner une image (PNG / JPG / JPEG).'
        return
    }

    try {
        const { BrowserQRCodeReader } = await import('@zxing/browser')
        const reader = new BrowserQRCodeReader()
        const url = URL.createObjectURL(file)
        try {
            const result = await reader.decodeFromImageUrl(url)
            form.studentId = result.getText()
        } catch {
            errorMsg.value = 'Impossible de lire le QR code sur cette image.'
        } finally {
            URL.revokeObjectURL(url)
        }
    } catch {
        errorMsg.value = 'Librairie QR non disponible. Vérifie @zxing/browser.'
    }
}

function onSubmit () {
    errorMsg.value = ''
    const parsed = schema.safeParse({
        nom: form.nom,
        prenom: form.prenom,
        studentId: form.studentId,
        wantLocation: form.wantLocation
    })
    if (!parsed.success) {
        errorMsg.value = parsed.error.issues.map(i => i.message).join(' • ')
        return
    }

    const params = new URLSearchParams({
        first_name: form.prenom,
        last_name:  form.nom,
        id:         String(form.studentId || ''),
        visitor:    form.wantLocation ? '1' : '0',
        location:   form.wantLocation ? '1' : '0'
    })
    window.location.assign(`/api/apple?${params.toString()}`)
}
</script>

<template>
    <div class="min-h-screen flex flex-col">
    <UContainer class="flex-1 flex items-center justify-center">
        <UCard class="w-full max-w-3xl mx-auto">
            <template #header>
                <div class="flex items-center justify-center">
                    <h1 class="text-xl font-bold">QR Code d’accès dématérialisé – EPF</h1>
                </div>
            </template>

            <UForm :state="form" @submit="onSubmit" class="space-y-6 w-full max-w-2xl mx-auto">
                <div v-if="errorMsg">
                    <UAlert color="error" variant="soft" :title="errorMsg" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <UFormField label="Nom" required>
                        <UInput v-model="form.nom" placeholder="Dupont" class="w-full" />
                    </UFormField>

                    <UFormField label="Prénom" required>
                        <UInput v-model="form.prenom" placeholder="Camille" class="w-full" />
                    </UFormField>
                </div>

                <UCard>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <UFormField label="Identifiant étudiant" required>
                            <UInput v-model="form.studentId" placeholder="123456..." class="w-full" />
                        </UFormField>

                        <UFormField label="Saisie automatique (optionnel)">
                            <UButton variant="soft"  as="label" class="w-full md:w-auto">
                                Importer son QRCode (screenshot)
                                <input type="file" accept="image/*" class="hidden" @change="onQrUpload" />
                            </UButton>
                        </UFormField>
                    </div>
                </UCard>

                <UFormField>
                    <div class="flex items-center justify-center gap-3">
                        <UCheckbox v-model="form.wantLocation" />
                        <span class="select-none">Affichage automatique du badge à proximité de l'école</span>
                    </div>
                </UFormField>

                <div class="flex justify-center">
                    <button type="submit" class="flex items-center text-white px-6">
                        <img src="/passkit/apple-wallet_fr.svg" alt="Wallet" class="h-12 w-auto"/>
                    </button>
                </div>
            </UForm>

            <template #footer>
                <div class="text-xs text-center text-gray-500">
                    Astuce : si le QR n’est pas reconnu, recadre et augmente le contraste de l’image.
                </div>
            </template>
        </UCard>
    </UContainer>

    <footer class="py-6 text-center text-gray-500 text-sm w-full">
        <p>
            Made with ☕ + 🍕 •
            <a href="https://github.com/R3dlessX/epf-building-access-pass" target="_blank" rel="noopener" class="text-blue-600 hover:underline">GitHub</a> (open-source)
        </p>
    </footer>
    </div>
</template>

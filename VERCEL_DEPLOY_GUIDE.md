# 🚀 Deploy na Vercel - Guia Passo a Passo

## 1. 📋 Pré-requisitos
- ✅ Vercel CLI instalado
- ✅ Conta na Vercel (criar em: https://vercel.com)
- ✅ Projeto configurado com vercel.json

## 2. 🔐 Login na Vercel
```powershell
vercel login
```
- Escolha opção: "Continue with GitHub" ou "Continue with Email"
- Siga as instruções no navegador

## 3. 🚀 Deploy do Projeto
```powershell
# Na pasta do projeto
vercel --prod
```

## 4. ⚙️ Configuração do Deploy
Quando solicitado:
- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → Escolha sua conta
- **Link to existing project?** → `N` (No)
- **Project name?** → `livetip-webhook-test` (ou nome desejado)
- **In which directory?** → `.` (pasta atual)
- **Want to override settings?** → `N` (No)

## 5. 🌐 URL Gerada
Após o deploy, você receberá uma URL como:
```
https://livetip-webhook-test.vercel.app
```

## 6. 🔧 Configurar Webhook na LiveTip
Na página de configuração do webhook LiveTip:
- **URL de destino:** `https://sua-url.vercel.app/webhook`
- **Token secreto:** Use o token já gerado

## 7. 🧪 Testar
- Acesse: `https://sua-url.vercel.app`
- Faça um pagamento Bitcoin
- Verifique na página `/control` se recebeu o webhook

## 8. 📊 Monitoramento
- Dashboard Vercel: https://vercel.com/dashboard
- Logs em tempo real
- Métricas de performance

## 9. 🔄 Atualizações
Para atualizar o código:
```powershell
vercel --prod
```

## 🎯 Vantagens da Vercel:
- ✅ Deploy em segundos
- ✅ HTTPS automático
- ✅ URL permanente
- ✅ Logs detalhados
- ✅ Gratuito para projetos pessoais
- ✅ Integração com Git

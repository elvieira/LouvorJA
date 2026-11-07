!include "LogicLib.nsh"

!macro preInit
  ; Detecta o drive do sistema (geralmente C:)
  ReadEnvStr $R8 SYSTEMDRIVE
  StrCmp $R8 "" 0 +2
    StrCpy $R8 "C:"

  StrCpy $R9 "$R8\Louvor JA\Flute"

  ; Se nao houver instalacao previa registrada no Windows, pre-define o caminho padrao para C:\Louvor JA\Flute
  SetRegView 64
  ReadRegStr $0 HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation
  ${If} $0 == ""
    ReadRegStr $0 HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation
  ${EndIf}

  ${If} $0 == ""
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$R9"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$R9"
    SetRegView 32
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$R9"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$R9"
    StrCpy $INSTDIR "$R9"
  ${EndIf}
!macroend

!macro customInstall
  ; Pega a unidade onde o app foi instalado pelo usuario (ex: C:\ ou D:\)
  StrCpy $R8 $INSTDIR 3

  ; Cria as pastas internas do Flute (tudo em minusculo: data e system)
  CreateDirectory "$INSTDIR\data"
  CreateDirectory "$INSTDIR\data\avatars"
  CreateDirectory "$INSTDIR\system"

  ; Prepara o diretorio de midia compartilhado
  ; Subpastas em portugues: musicas, imagens, capas (sem avatars, que e exclusivo do Flute)
  StrCpy $R9 "$R8Louvor JA\Media"
  CreateDirectory "$R9"
  CreateDirectory "$R9\musicas"
  CreateDirectory "$R9\imagens"
  CreateDirectory "$R9\capas"

  ; Concede permissao de escrita ao grupo de Usuarios (SID universal independente do idioma do Windows)
  ExecWait 'icacls "$R9" /grant *S-1-5-32-545:(OI)(CI)M /T /Q'
  ExecWait 'icacls "$INSTDIR\data" /grant *S-1-5-32-545:(OI)(CI)M /T /Q'
  ExecWait 'icacls "$INSTDIR\system" /grant *S-1-5-32-545:(OI)(CI)M /T /Q'
!macroend

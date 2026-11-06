!include "LogicLib.nsh"

Var /GLOBAL CustomSystemDrive
Var /GLOBAL DefaultLouvorJAPath
Var /GLOBAL SharedMediaPath

!macro preInit
  ; Detecta o drive do sistema (geralmente C:)
  ReadEnvStr $CustomSystemDrive SYSTEMDRIVE
  StrCmp $CustomSystemDrive "" 0 +2
    StrCpy $CustomSystemDrive "C:"

  StrCpy $DefaultLouvorJAPath "$CustomSystemDrive\Louvor JA\Flute"

  ; Se nao houver instalacao previa registrada no Windows, pre-define o caminho padrao para C:\Louvor JA\Flute
  SetRegView 64
  ReadRegStr $0 HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation
  ${If} $0 == ""
    ReadRegStr $0 HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation
  ${EndIf}

  ${If} $0 == ""
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$DefaultLouvorJAPath"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$DefaultLouvorJAPath"
    SetRegView 32
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$DefaultLouvorJAPath"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$DefaultLouvorJAPath"
    StrCpy $INSTDIR "$DefaultLouvorJAPath"
  ${EndIf}
!macroend

!macro customInstall
  ; Pega a unidade onde o app foi instalado pelo usuario (ex: C:\ ou D:\)
  StrCpy $1 $INSTDIR 3

  ; Cria as pastas internas do Flute (tudo em minusculo: data e system)
  CreateDirectory "$INSTDIR\data"
  CreateDirectory "$INSTDIR\data\avatars"
  CreateDirectory "$INSTDIR\system"

  ; Prepara o diretorio de midia compartilhado
  ; Subpastas em portugues: musicas, imagens, capas (sem avatars, que e exclusivo do Flute)
  StrCpy $SharedMediaPath "$1Louvor JA\Media"
  CreateDirectory "$SharedMediaPath"
  CreateDirectory "$SharedMediaPath\musicas"
  CreateDirectory "$SharedMediaPath\imagens"
  CreateDirectory "$SharedMediaPath\capas"

  ; Concede permissao de escrita ao grupo de Usuarios (SID universal independente do idioma do Windows)
  ExecWait 'icacls "$SharedMediaPath" /grant *S-1-5-32-545:(OI)(CI)M /T /Q'
  ExecWait 'icacls "$INSTDIR\data" /grant *S-1-5-32-545:(OI)(CI)M /T /Q'
  ExecWait 'icacls "$INSTDIR\system" /grant *S-1-5-32-545:(OI)(CI)M /T /Q'
!macroend

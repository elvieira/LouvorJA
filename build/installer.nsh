!include "LogicLib.nsh"

!ifndef BUILD_UNINSTALLER
Function normalizeInstallationDir
  ; 1. Remove barra invertida final se houver (ex: C:\Program Files\Louvor JA\ -> C:\Program Files\Louvor JA)
  StrCpy $0 $INSTDIR 1 -1
  ${If} $0 == "\"
    StrCpy $INSTDIR $INSTDIR -1
  ${EndIf}

  ; 2. Se ja termina em "\Louvor JA\Flute" (16 caracteres), ja esta correto!
  StrCpy $0 $INSTDIR 16 -16
  ${If} $0 == "\Louvor JA\Flute"
    Return
  ${EndIf}

  ; 3. Se termina em "\Louvor JA" (10 caracteres), adiciona apenas \Flute
  StrCpy $0 $INSTDIR 10 -10
  ${If} $0 == "\Louvor JA"
    StrCpy $INSTDIR "$INSTDIR\Flute"
    Return
  ${EndIf}

  ; 4. Se termina em "\Flute" (6 caracteres), remove \Flute e adiciona \Louvor JA\Flute
  StrCpy $0 $INSTDIR 6 -6
  ${If} $0 == "\Flute"
    StrCpy $INSTDIR $INSTDIR -6
    StrCpy $INSTDIR "$INSTDIR\Louvor JA\Flute"
    Return
  ${EndIf}

  ; 5. Caso geral (ex: D:, C:\Program Files, etc.): anexa \Louvor JA\Flute
  StrCpy $0 $INSTDIR 1 -1
  ${If} $0 == "\"
    StrCpy $INSTDIR "$INSTDIRLouvor JA\Flute"
  ${Else}
    StrCpy $INSTDIR "$INSTDIR\Louvor JA\Flute"
  ${EndIf}
FunctionEnd

!macro customPageAfterChangeDir
  !undef MUI_PAGE_CUSTOMFUNCTION_PRE
  !define MUI_PAGE_CUSTOMFUNCTION_PRE normalizeInstallationDir
!macroend
!endif

!macro preInit
  ; Detecta o drive do sistema (geralmente C:)
  ReadEnvStr $R8 SYSTEMDRIVE
  StrCmp $R8 "" 0 +2
    StrCpy $R8 "C:"

  StrCpy $R9 "$R8\Louvor JA\Flute"

  SetRegView 64
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$R9"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$R9"
  SetRegView 32
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$R9"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$R9"
  SetRegView 64
  StrCpy $INSTDIR "$R9"
!macroend

!macro customInit
  ; Garante em tempo de execucao que o caminho padrao seja sempre C:\Louvor JA\Flute
  ReadEnvStr $R8 SYSTEMDRIVE
  StrCmp $R8 "" 0 +2
    StrCpy $R8 "C:"

  StrCpy $INSTDIR "$R8\Louvor JA\Flute"
!macroend

!macro customInstall
  ; Cria as pastas internas do Flute (tudo em minusculo: data e system)
  CreateDirectory "$INSTDIR\data"
  CreateDirectory "$INSTDIR\data\avatars"
  CreateDirectory "$INSTDIR\system"

  ; Como $INSTDIR sempre termina em \Flute (6 caracteres), removemos \Flute para obter a pasta pai Louvor JA
  StrCpy $R7 $INSTDIR -6

  ; Prepara o diretorio de midia compartilhado como irmao de Flute dentro de Louvor JA
  ; Subpastas em portugues: musicas, imagens, capas (sem avatars, que e exclusivo do Flute)
  StrCpy $R9 "$R7\Media"
  CreateDirectory "$R9"
  CreateDirectory "$R9\musicas"
  CreateDirectory "$R9\imagens"
  CreateDirectory "$R9\capas"

  ; Concede permissao de escrita ao grupo de Usuarios (SID universal independente do idioma do Windows)
  ExecWait 'icacls "$R9" /grant *S-1-5-32-545:(OI)(CI)M /T /Q'
  ExecWait 'icacls "$INSTDIR\data" /grant *S-1-5-32-545:(OI)(CI)M /T /Q'
  ExecWait 'icacls "$INSTDIR\system" /grant *S-1-5-32-545:(OI)(CI)M /T /Q'
!macroend

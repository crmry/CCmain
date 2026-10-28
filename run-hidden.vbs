Set objFSO = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

If Not objFSO.FolderExists(objFSO.BuildPath(strPath, "bin")) Then
    If objFSO.FolderExists("C:\CCmain\bin") Then
        strPath = "C:\CCmain"
    End If
End If

WshShell.CurrentDirectory = strPath
stopBat = objFSO.BuildPath(strPath, "stop-server.bat")
If objFSO.FileExists(stopBat) Then
    WshShell.Run """" & stopBat & """ --nopause", 0, True
End If

nodeExe = objFSO.BuildPath(strPath, "bin\node.exe")
serverJs = objFSO.BuildPath(strPath, "server.js")

If objFSO.FileExists(nodeExe) Then
    WshShell.Run """" & nodeExe & """ """ & serverJs & """", 0, False
Else
    WshShell.Run "node """ & serverJs & """", 0, False
End If



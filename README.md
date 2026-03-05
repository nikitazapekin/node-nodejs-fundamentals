Команда 

npm run fs:snapshot 

создает отчет по директории workspace в виде сгенерированного snapshot.json


Команда

npm run fs:restore 

восстанавливает контент папки workspace в папку workspace_restored при помощи snapshot.json 



Команда 
npm run fs:findByExt 

ищет все файлы с определенным расширением в папке workspace и выводит их пути, отсортированные по алфавиту


Команда 

npm run fs:merge

объединяет содержимое файлой из workspace/parts в один файл merged.txt, расположенный в workspace/merged.txt

Команда

npm run cli:interactive
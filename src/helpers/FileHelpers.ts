export const fileToText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    const data = file.slice(0, file.size);

    fr.onloadend = function() {
      const result = fr.result as string;
      resolve(result);
    };

    fr.onerror = function(error) {
      reject(error);
    };

    fr.readAsText(data);
  });

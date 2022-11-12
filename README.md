<p align="center">
    <img width="15%" alt="logo" src="https://user-images.githubusercontent.com/60835181/186134066-2b9b0e78-d0a5-43cb-ac75-ad2c1b33d21e.png">

English | [한글](https://github.com/DS2BRAIN/ds2/blob/main/README_KO.md)

</p>

---

Easiest way to use AI models without coding (Web UI & API support)

![text-to-image](https://user-images.githubusercontent.com/60835181/187056253-63e20fdf-632e-4348-bb03-c389231f0d6d.gif)

 - Easy to use SOTA models including OCR, GPT, STT, TTS, Image to Text, Translations

 - Manual & Auto Annotation Tools (Tableur, Text, Image, Recommeder system)

 - ML & DL Training (Pytorch, Tensorflow, XGboost, etc)

 - AI Aalytics (Prescriptive analysis and Data analytics with Metabase)

 - AI Model Deployment and monitoring

 - Use Active learning process
 
 - API & Python SDK Support
 

---

### Install

[Extended documentation for DS2](https://docs.ds2.ai)

---

## 1) Easy to use SOTA models


### Image to Text

![image-to-text](https://user-images.githubusercontent.com/60835181/187056114-a891abf0-0088-4a70-af18-95daf68675d6.gif)

### Speech to Text (STT)

![speech-to-text](https://user-images.githubusercontent.com/60835181/187056288-0d27df5e-75c0-4fe5-84db-f3a20a2294e4.gif)

### GPT

![GPT](https://user-images.githubusercontent.com/60835181/187056264-3db79b87-5656-4233-b23d-4ffa532ed557.gif)

### Translation

![translation](https://user-images.githubusercontent.com/60835181/187056261-8d558ca0-6c35-4081-808b-609871b1b74e.gif)


### Text to Image (Like stable-diffusion)

![text-to-image](https://user-images.githubusercontent.com/60835181/187056253-63e20fdf-632e-4348-bb03-c389231f0d6d.gif)


and also you can use **OCR, Text summary, fill mask, text to speech (TTS)**. In DS2, you can change the model to another one from Hugging face.

---


## 2) Easy to build the customized AI model with MLOps process

### DS2 provides active learning process based on an automated machine learning pipeline.

<p align="center">
    <img width="50%" alt="pa" src="https://user-images.githubusercontent.com/60835181/186130479-584d0aa4-65fb-48ae-88dc-09ba9346256d.png">
</p>

### 1. Training AI models

After labeling is complete, artificial intelligence can be developed using the learning data. Click the “Start AI Development” button on the dataset or labeling project screen to enter the setting screen for AI development. 
On the setting screen, three types of development environments are supported.
- Manual setting: Select the desired deep learning & machine learning library (Pytorch, Tensorflow, XGboost, etc.)
- Fast learning speed (AutoML): A function that creates a model by speeding up the learning rate among AutoML learning techniques
- High Accuracy (AutoML): A function that creates a model with high accuracy among AutoML learning techniques

After selecting the desired learning method, click the Start button on the right to start learning. If you click the "Model" tab at the bottom after starting, you can check the progress of the model being developed. It provides the function of "distribute" and the function of "analyzing" through the data set of the prediction result created by the model.

* Setting Training Options
![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FdklUDntQ1Pl0m3eHCvN4%2Fuploads%2FiTSJJ0Y7N8evuJlhSG4s%2FScreenshot%20from%202022-08-16%2016-55-26.png?alt=media&token=9858bd59-f47f-4c67-8cbc-ae6683e4c452)

* Confusion Matrix
![Confusion Matrix](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FdklUDntQ1Pl0m3eHCvN4%2Fuploads%2FyLLLjg3AYBEkEfo7bRAI%2Fconfusion_matrix.png?alt=media&token=3cc0160b-bc35-4bdf-afa5-80bbf890df79)

* Feature Importance
![Feature Importance](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FdklUDntQ1Pl0m3eHCvN4%2Fuploads%2FOi0m7F87Hvk4fz4sSNoI%2Ffeature_importance(1).png?alt=media&token=a8418d6c-1f51-46f6-b70c-e1e5eb25e940)


### 2. Run prescriptive analytics

Once the optimal model has been selected, prescriptive analysis can be run to gain insights from sentences built around explainable AI (XAI).

![Prescriptive Analytics](https://user-images.githubusercontent.com/60835181/185800119-a2a48213-12aa-4e7a-a834-765c14613fb7.png)


### 3. Deploy AI models

You can use the Deploy Model function by completing training through DS2.ai or uploading a model you have already created to DS2.ai. (The ability to upload models directly supports Pytorch and Tensorflow2 models.)

You can upload by clicking the "Deploy" menu button at the top or distribute the developed model through the "Deploy" function in the "Learning" menu.
The deployed model can be managed through a separate endpoint, and the number of API calls can be monitored.

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FdklUDntQ1Pl0m3eHCvN4%2Fuploads%2Fv8JfkiCs4YTajVEM7AvG%2Fdeploy.png?alt=media&token=437a4dda-5c58-40a6-8473-34e6e24c1e39)

After the model is deployed, the input and output values used for prediction are automatically stored in the dataset, helping to quickly and easily create AI with higher accuracy through active learning.

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FdklUDntQ1Pl0m3eHCvN4%2Fuploads%2FxLiSO1F6CFFId6rjd6Hg%2FScreenshot%20from%202022-08-14%2011-28-30.png?alt=media&token=59d7eb64-36a5-42f2-8968-a4238a66225d)


### 4. Annotation for re-learning

Supports training data labeling tools needed to create artificial intelligence models. 
After clicking Labeling on the top menu, upload the dataset, and you can start labeling by selecting the desired function between manual labeling and auto-labeling tool.
(Labeling tool type: Tablur(Classification, Regression), Text, Image, Object Detection)

![Watch the video](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FdklUDntQ1Pl0m3eHCvN4%2Fuploads%2FQVuhYB5hjxlHse63uM4v%2Fautolabeling_en.gif?alt=media&token=e368e1b1-d43f-4d04-929a-51246a5993d3)


### Use Python SDK 

One of the powerful features of DS2.ai is the manual setting function that can easily set up learning under various conditions to derive an optimal artificial intelligence model.
```bash
pip install ds2ai
```
After completing the installation of the ds2ai Python library, you can start learning using the example below.

```python
import ds2ai
ds2 = ds2ai.DS2("your-app-code")

project = ds2.train(
    "BankMarketing.csv",
    option="custom",
    training_method="normal",
    value_for_predict="is_charge",
    algorithm="keras_ann",
    hyper_params={
      "layer_width": [20,3,5],
      "layer_deep": [3],
      "epochs": [10],
      "loss_function": ["mean_squared_error"],
      "optimizer": [
        {
          "clipvalue": 0.5,
          "learning_rate": 0.001,
          "beta_1": 0.9,
          "beta_2": 0.9999,
          "epsilon": None,
          "decay": 0,
          "amsgrad": False,
          "function_name": "Adam"
        }
      ],
      "activation": ["relu"],
      "batch_size": [32],
      "output_activation": ["relu"]
    }
)
```

You can check the app code by clicking the user name in the upper right corner. You can start learning with the code above after putting this app code as shown below.
```python
ds2 = ds2ai.DS2("Your App code")
```
After the code is executed, the ability to predict or deploy the job situation and the trained model is available in ds2.ai as-is. For more information on how to use, refer to "SDK | PYTHON" in the left menu.


### Use API

After completing the installation, access to http://localhost:13002/skyhubredoc to check the API information.

<p align="center">
    <img width="80%" alt="logo" src="https://user-images.githubusercontent.com/60835181/187060752-5c13324e-42e4-4a31-b96f-626c43515d32.png">
</p>

You can use all DS2 functions through API and Python SDK.

---

### BibTeX entry and citation info of the SOTA models

```bibtex
@article{DBLP:journals/corr/abs-1810-04805,
  author    = {Jacob Devlin and
               Ming{-}Wei Chang and
               Kenton Lee and
               Kristina Toutanova},
  title     = {{BERT:} Pre-training of Deep Bidirectional Transformers for Language
               Understanding},
  journal   = {CoRR},
  volume    = {abs/1810.04805},
  year      = {2018},
  url       = {http://arxiv.org/abs/1810.04805},
  archivePrefix = {arXiv},
  eprint    = {1810.04805},
  timestamp = {Tue, 30 Oct 2018 20:39:56 +0100},
  biburl    = {https://dblp.org/rec/journals/corr/abs-1810-04805.bib},
  bibsource = {dblp computer science bibliography, https://dblp.org}
}
```

```bibtex
@misc{grosman2021xlsr53-large-english,
  title={Fine-tuned {XLSR}-53 large model for speech recognition in {E}nglish},
  author={Grosman, Jonatas},
  howpublished={\url{https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-english}},
  year={2021}
}
```

```bibtex
@misc{fan2020englishcentric,
      title={Beyond English-Centric Multilingual Machine Translation}, 
      author={Angela Fan and Shruti Bhosale and Holger Schwenk and Zhiyi Ma and Ahmed El-Kishky and Siddharth Goyal and Mandeep Baines and Onur Celebi and Guillaume Wenzek and Vishrav Chaudhary and Naman Goyal and Tom Birch and Vitaliy Liptchinsky and Sergey Edunov and Edouard Grave and Michael Auli and Armand Joulin},
      year={2020},
      eprint={2010.11125},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```


```bibtex
@misc{li2021trocr,
      title={TrOCR: Transformer-based Optical Character Recognition with Pre-trained Models}, 
      author={Minghao Li and Tengchao Lv and Lei Cui and Yijuan Lu and Dinei Florencio and Cha Zhang and Zhoujun Li and Furu Wei},
      year={2021},
      eprint={2109.10282},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```


```bibtex
@article{DBLP:journals/corr/abs-1910-13461, author = {Mike Lewis and Yinhan Liu and Naman Goyal and Marjan Ghazvininejad and Abdelrahman Mohamed and Omer Levy and Veselin Stoyanov and Luke Zettlemoyer}, title = {{BART:} Denoising Sequence-to-Sequence Pre-training for Natural Language Generation, Translation, and Comprehension}, journal = {CoRR}, volume = {abs/1910.13461}, year = {2019}, url = {http://arxiv.org/abs/1910.13461}, eprinttype = {arXiv}, eprint = {1910.13461}, timestamp = {Thu, 31 Oct 2019 14:02:26 +0100}, biburl = {https://dblp.org/rec/journals/corr/abs-1910-13461.bib}, bibsource = {dblp computer science bibliography, https://dblp.org} }
```

```bibtex
@misc{watanabe2018espnet,
      title={ESPnet: End-to-End Speech Processing Toolkit}, 
      author={Shinji Watanabe and Takaaki Hori and Shigeki Karita and Tomoki Hayashi and Jiro Nishitoba and Yuya Unno and Nelson Enrique Yalta Soplin and Jahn Heymann and Matthew Wiesner and Nanxin Chen and Adithya Renduchintala and Tsubasa Ochiai},
      year={2018},
      eprint={1804.00015},
      archivePrefix={arXiv},
      primaryClass={cs.CL}
}
```

```bibtex
@article{radford2019language,
  title={Language Models are Unsupervised Multitask Learners},
  author={Radford, Alec and Wu, Jeff and Child, Rewon and Luan, David and Amodei, Dario and Sutskever, Ilya},
  year={2019}
}


```bibtext
@InProceedings{Rombach_2022_CVPR,
        author    = {Rombach, Robin and Blattmann, Andreas and Lorenz, Dominik and Esser, Patrick and Ommer, Bj\"orn},
        title     = {High-Resolution Image Synthesis With Latent Diffusion Models},
        booktitle = {Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR)},
        month     = {June},
        year      = {2022},
        pages     = {10684-10695}
    }
```

### License

Each file included in this repository is licensed under the [Apache License 2.0](https://github.com/DS2BRAIN/ds2/blob/main/LICENSE) BY License.

---

### Contributing

This project exists thanks to all the people who contribute. 

Please read the [contribution guidelines](https://github.com/DS2BRAIN/ds2/blob/main/CONTRIBUTING.md) before submitting a pull request.

<img width="15%" alt="logo" src="https://user-images.githubusercontent.com/60835181/186133830-22521078-6d9c-48e8-a45f-d78674b43b59.png">


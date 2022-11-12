<p align="center">
    <img width="15%" alt="logo" src="https://user-images.githubusercontent.com/60835181/186134066-2b9b0e78-d0a5-43cb-ac75-ad2c1b33d21e.png">

[English](https://github.com/DS2BRAIN/ds2/blob/main/README.md) | 한글

</p>

---


 ### DS2.ai - 인공지능 모델을 코딩없이 쉽게 사용하세요. (Web UI & API 지원)

![text-to-image](https://user-images.githubusercontent.com/60835181/187056253-63e20fdf-632e-4348-bb03-c389231f0d6d.gif)

 - 메뉴얼 & 오토 라벨링 툴 (정형화, 텍스트, 이미지, 추천시스템) 

 - 머신러닝 & 딥러닝 학습 (Pytorch, Tensorflow, XGboost, etc) 

 - AI 분석 (처방적 분석과 데이터 분석 지원) 

 - AI 모델 배포와 모니터링 

 - 액티브 러닝 프로세스 지원

 - 쉬운 SOTA 모델 사용 지원 (OCR, GPT, STT, TTS, Image to Text, 번역등)
 
 - API & Python SDK Support

---

### 설치하기

[DS2 가이드](https://krdocs.ds2.ai)

---

## 1) SOTA 모델 이용하기


### Image to Text (그림 설명 요약)

![image-to-text](https://user-images.githubusercontent.com/60835181/187056114-a891abf0-0088-4a70-af18-95daf68675d6.gif)

### Speech to Text (STT)

![speech-to-text](https://user-images.githubusercontent.com/60835181/187056288-0d27df5e-75c0-4fe5-84db-f3a20a2294e4.gif)

### GPT (문장 합성)

![GPT](https://user-images.githubusercontent.com/60835181/187056264-3db79b87-5656-4233-b23d-4ffa532ed557.gif)

### 번역

![translation](https://user-images.githubusercontent.com/60835181/187056261-8d558ca0-6c35-4081-808b-609871b1b74e.gif)


### Text to Image

![text-to-image](https://user-images.githubusercontent.com/60835181/187056253-63e20fdf-632e-4348-bb03-c389231f0d6d.gif)


또한 **OCR, 텍스트 요약, FILL MASK, TTS(텍스트 음성 변환)** 를 사용할 수도 있습니다. DS2 내에서 Hugging Face에서 제공하는 다른 모델로 변경해서 사용할 수도 있습니다.

---

---

## 2) SOTA 알고리즘과 함께 쉬운 커스텀 AI 모델 생성

### DS2는 자동화된 기계 학습 파이프라인을 기반으로 하는 능동적 학습 프로세스를 제공합니다.

<p align="center">
    <img width="50%" alt="pa" src="https://user-images.githubusercontent.com/60835181/186130479-584d0aa4-65fb-48ae-88dc-09ba9346256d.png">
</p>

### 1. AI 모델 학습

라벨링이 완료되면 학습 데이터를 사용하여 인공 지능을 개발할 수 있습니다. 데이터셋 또는 라벨링 프로젝트 화면에서 “AI 개발 시작” 버튼을 클릭하여 AI 개발 설정 화면으로 진입합니다.
설정 화면에서는 3가지 유형의 개발 환경을 지원합니다.

- 수동 설정: 딥러닝 & 머신러닝 라이브러리 및 하이퍼파라미터 직접 설정 (Pytorch, Tensorflow, XGboost, etc.)
- 학습 속도를 빠르게 (AutoML): AutoML 학습 기법 중 학습 속도를 높여 모델을 생성하는 기능
- 정확도를 놓게 (AutoML): AutoML 학습 기법 중 정확도가 높은 모델을 생성하는 기능

원하는 학습 방법을 선택한 후 우측 시작 버튼을 클릭하면 학습이 시작됩니다. 시작 후 하단의 "모델" 탭을 클릭하면 개발 중인 모델의 진행 상황을 확인할 수 있습니다. 모델이 생성한 예측 결과의 데이터 세트를 통해 "배포" 기능과 "분석" 기능을 제공합니다.

* 학습 방법 설정
![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FdklUDntQ1Pl0m3eHCvN4%2Fuploads%2FiTSJJ0Y7N8evuJlhSG4s%2FScreenshot%20from%202022-08-16%2016-55-26.png?alt=media&token=9858bd59-f47f-4c67-8cbc-ae6683e4c452)

* Confusion Matrix
![Confusion Matrix](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FdklUDntQ1Pl0m3eHCvN4%2Fuploads%2FyLLLjg3AYBEkEfo7bRAI%2Fconfusion_matrix.png?alt=media&token=3cc0160b-bc35-4bdf-afa5-80bbf890df79)

* Feature Importance
![Feature Importance](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FdklUDntQ1Pl0m3eHCvN4%2Fuploads%2FOi0m7F87Hvk4fz4sSNoI%2Ffeature_importance(1).png?alt=media&token=a8418d6c-1f51-46f6-b70c-e1e5eb25e940)


### 2. 처방적 분석 실행하기

최적의 모델이 선택되면 설명 가능한 AI(XAI)를 기반으로 구축된 문장에서 통찰력을 얻기 위해 처방적 분석을 실행할 수 있습니다.

![Prescriptive Analytics](https://user-images.githubusercontent.com/60835181/185800119-a2a48213-12aa-4e7a-a834-765c14613fb7.png)


### 3. AI 모델 배포하기

DS2.ai를 통해 교육을 완료하거나 이미 생성한 모델을 DS2.ai에 업로드하여 모델 배포 기능을 사용할 수 있습니다. (모델 업로드 기능은 Pytorch 및 Tensorflow2 모델을 직접 지원합니다.)

상단의 '배포' 메뉴 버튼을 클릭하여 업로드하거나 '학습' 메뉴의 '배포' 기능을 통해 개발된 모델을 배포할 수 있습니다.
배포된 모델은 별도의 엔드포인트를 통해 관리할 수 있으며, API 호출 횟수를 모니터링할 수 있습니다.

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FdklUDntQ1Pl0m3eHCvN4%2Fuploads%2Fv8JfkiCs4YTajVEM7AvG%2Fdeploy.png?alt=media&token=437a4dda-5c58-40a6-8473-34e6e24c1e39)

모델 배포 후 예측에 사용된 입력 및 출력 값이 자동으로 데이터셋에 저장되어 능동적 학습을 통해 보다 빠르고 쉽게 정확도가 높은 AI를 생성할 수 있습니다.

![](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FdklUDntQ1Pl0m3eHCvN4%2Fuploads%2FxLiSO1F6CFFId6rjd6Hg%2FScreenshot%20from%202022-08-14%2011-28-30.png?alt=media&token=59d7eb64-36a5-42f2-8968-a4238a66225d)


### 4. 재학습을 위한 라벨링

인공 지능 모델을 생성하는 데 필요한 훈련 데이터 레이블링 도구를 지원합니다.

상단 메뉴에서 Labeling을 클릭한 후 데이터셋을 업로드하면 수동 라벨링과 자동 라벨링 도구 중 원하는 기능을 선택하여 라벨링을 시작할 수 있습니다.

(라벨링 툴 종류: 정형화(분류, 회귀), 텍스트, 이미지, 객체 감지)

![비디오 보기](https://files.gitbook.com/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FdklUDntQ1Pl0m3eHCvN4%2Fuploads%2FQVuhYB5hjxlHse63uM4v%2Fautolabeling_en.gif?alt=media&token=e368e1b1-d43f-4d04-929a-51246a5993d3)



### Use Python SDK 

DS2.ai의 강력한 기능 중 하나는 최적의 인공지능 모델을 도출하기 위해 다양한 조건에서 학습을 쉽게 설정할 수 있는 수동 설정 기능입니다.

```bash
pip install ds2ai
```

ds2ai Python 라이브러리 설치를 완료한 후 아래 예제를 사용하여 학습을 시작할 수 있습니다.

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

우측 상단의 사용자 이름을 클릭하면 앱 코드를 확인할 수 있습니다. 아래와 같이 이 앱 코드를 입력한 후 위의 코드로 학습을 시작할 수 있습니다.
```python
ds2 = ds2ai.DS2("Your App code")
```
코드가 실행된 후 작업 상황과 훈련된 모델을 예측하거나 배포하는 기능을 ds2.ai에서 있는 그대로 사용할 수 있습니다. 자세한 사용법은 가이드 왼쪽 메뉴의 "SDK | PYTHON"을 참고하세요.

### Use API

설치 완료 후 http://localhost:13002/skyhubredoc에 접속하여 API 정보를 확인할 수 있습니다.

<p align="center">
    <img width="80%" alt="logo" src="https://user-images.githubusercontent.com/60835181/187060752-5c13324e-42e4-4a31-b96f-626c43515d32.png">
</p>

API 및 Python SDK를 통해 모든 DS2 기능을 사용할 수 있습니다.

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
